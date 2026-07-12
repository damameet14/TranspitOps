"""Upload, list, download, and delete vehicle documents."""

import os
from datetime import date
from pathlib import Path
from typing import Annotated
from uuid import uuid4
from fastapi import APIRouter, Depends, File, Form, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from source.application_startup.database_connection import get_database_session
from source.shared_infrastructure.database_models.user_account_model import UserAccount, UserRole
from source.shared_infrastructure.database_models.vehicle_document_model import VehicleDocument
from source.shared_infrastructure.database_models.vehicle_model import Vehicle
from source.shared_infrastructure.role_based_access_control import get_current_authenticated_user, require_role
from source.shared_infrastructure.standard_error_responses import ResourceNotFoundError, TransitOpsError

vehicle_document_router = APIRouter(prefix="/vehicle-documents", tags=["vehicle documents"])
STORAGE_ROOT = Path(os.getenv("VEHICLE_DOCUMENT_STORAGE_PATH", "/application_data/vehicle_documents"))
MAX_DOCUMENT_BYTES = 5 * 1024 * 1024
ALLOWED_CONTENT_TYPES = {"application/pdf", "image/png", "image/jpeg"}


def _response(document: VehicleDocument) -> dict:
    return {"id":document.id,"vehicle_id":document.vehicle_id,"vehicle_registration_number":document.vehicle.registration_number if document.vehicle else None,"document_type":document.document_type,"file_name":document.file_name,"content_type":document.content_type,"expiry_date":document.expiry_date,"created_at":document.created_at}


@vehicle_document_router.get("")
def list_documents(current_user: Annotated[UserAccount, Depends(get_current_authenticated_user)], database_session: Annotated[Session, Depends(get_database_session)], vehicle_id: int | None = None) -> list[dict]:
    query = database_session.query(VehicleDocument)
    if vehicle_id is not None: query = query.filter(VehicleDocument.vehicle_id == vehicle_id)
    return [_response(document) for document in query.order_by(VehicleDocument.created_at.desc()).all()]


@vehicle_document_router.post("", status_code=201)
async def upload_document(
    current_user: Annotated[UserAccount, Depends(require_role(UserRole.FLEET_MANAGER, UserRole.SAFETY_OFFICER))],
    database_session: Annotated[Session, Depends(get_database_session)],
    vehicle_id: Annotated[int, Form()], document_type: Annotated[str, Form()],
    document: Annotated[UploadFile, File()], expiry_date: Annotated[date | None, Form()] = None,
) -> dict:
    if database_session.query(Vehicle).filter(Vehicle.id == vehicle_id).first() is None: raise ResourceNotFoundError("Vehicle", vehicle_id)
    if document.content_type not in ALLOWED_CONTENT_TYPES: raise TransitOpsError(422, "Only PDF, PNG, and JPEG vehicle documents are accepted.", "UNSUPPORTED_DOCUMENT_TYPE")
    content = await document.read(MAX_DOCUMENT_BYTES + 1)
    if len(content) > MAX_DOCUMENT_BYTES: raise TransitOpsError(422, "Vehicle documents must be 5 MB or smaller.", "DOCUMENT_TOO_LARGE")
    STORAGE_ROOT.mkdir(parents=True, exist_ok=True)
    safe_suffix = Path(document.filename or "document").suffix.lower()
    stored_path = STORAGE_ROOT / f"{uuid4().hex}{safe_suffix}"
    stored_path.write_bytes(content)
    record = VehicleDocument(vehicle_id=vehicle_id, document_type=document_type.strip(), file_name=Path(document.filename or "document").name, content_type=document.content_type, storage_path=str(stored_path), expiry_date=expiry_date)
    database_session.add(record); database_session.commit(); database_session.refresh(record)
    return _response(record)


@vehicle_document_router.get("/{document_id}/download")
def download_document(document_id: int, current_user: Annotated[UserAccount, Depends(get_current_authenticated_user)], database_session: Annotated[Session, Depends(get_database_session)]):
    document = database_session.query(VehicleDocument).filter(VehicleDocument.id == document_id).first()
    if document is None: raise ResourceNotFoundError("Vehicle document", document_id)
    if not Path(document.storage_path).is_file(): raise ResourceNotFoundError("Stored vehicle document", document_id)
    return FileResponse(document.storage_path, media_type=document.content_type, filename=document.file_name)


@vehicle_document_router.delete("/{document_id}", status_code=204)
def delete_document(document_id: int, current_user: Annotated[UserAccount, Depends(require_role(UserRole.FLEET_MANAGER, UserRole.SAFETY_OFFICER))], database_session: Annotated[Session, Depends(get_database_session)]) -> None:
    document = database_session.query(VehicleDocument).filter(VehicleDocument.id == document_id).first()
    if document is None: raise ResourceNotFoundError("Vehicle document", document_id)
    stored_path = Path(document.storage_path)
    database_session.delete(document); database_session.commit()
    stored_path.unlink(missing_ok=True)
