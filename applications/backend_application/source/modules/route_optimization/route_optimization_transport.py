"""HTTP transport layer for route optimization suggestions.

Routes:
    POST /routes/suggest           — Get a route suggestion for source/destination
    GET  /routes/suggestions       — List all saved route suggestions
    GET  /routes/available-routes  — List all known routes in the matrix
"""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from source.application_startup.database_connection import get_database_session
from source.shared_infrastructure.database_models.user_account_model import UserAccount
from source.shared_infrastructure.database_models.route_suggestion_model import RouteSuggestion
from source.shared_infrastructure.role_based_access_control import get_current_authenticated_user

from source.modules.route_optimization.route_optimization_contracts import (
    RouteOptimizationRequest,
    RouteSuggestionResponse,
)
from source.modules.route_optimization.suggest_route import suggest_route_and_persist
from source.modules.route_optimization.ahmedabad_rule_based_provider import AHMEDABAD_ROUTE_MATRIX


route_optimization_router = APIRouter(
    prefix="/routes",
    tags=["route optimization"],
)


@route_optimization_router.post("/suggest", response_model=RouteSuggestionResponse, status_code=201)
def suggest_route(
    request: RouteOptimizationRequest,
    current_user: Annotated[UserAccount, Depends(get_current_authenticated_user)],
    database_session: Annotated[Session, Depends(get_database_session)],
) -> RouteSuggestionResponse:
    """Get a route suggestion for the given source and destination.

    Uses rule-based provider for Ahmedabad-area routes.
    Returns 404 if no route is found in the matrix.
    """
    suggestion = suggest_route_and_persist(database_session, request)

    if suggestion is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "detail": f"No route found from '{request.source}' to '{request.destination}'. "
                          "Only Ahmedabad and Gujarat routes are supported in v1.",
                "code": "ROUTE_NOT_FOUND",
            },
        )

    return _suggestion_to_response(suggestion)


@route_optimization_router.get("/suggestions", response_model=list[RouteSuggestionResponse])
def list_route_suggestions(
    current_user: Annotated[UserAccount, Depends(get_current_authenticated_user)],
    database_session: Annotated[Session, Depends(get_database_session)],
) -> list[RouteSuggestionResponse]:
    """List all saved route suggestions, most recent first."""
    suggestions = (
        database_session.query(RouteSuggestion)
        .order_by(RouteSuggestion.created_at.desc())
        .all()
    )
    return [_suggestion_to_response(s) for s in suggestions]


@route_optimization_router.get("/available-routes")
def list_available_routes(
    current_user: Annotated[UserAccount, Depends(get_current_authenticated_user)],
) -> list[dict]:
    """List all routes available in the rule-based provider matrix."""
    routes = []
    for (source, destination), (distance, duration) in AHMEDABAD_ROUTE_MATRIX.items():
        routes.append({
            "source": source.title(),
            "destination": destination.title(),
            "distance_km": distance,
            "duration_minutes": duration,
        })
    return routes


def _suggestion_to_response(suggestion) -> RouteSuggestionResponse:
    return RouteSuggestionResponse(
        id=suggestion.id,
        trip_id=suggestion.trip_id,
        source=suggestion.source,
        destination=suggestion.destination,
        provider=suggestion.provider.value,
        suggested_distance_km=float(suggestion.suggested_distance_km),
        suggested_duration_minutes=float(suggestion.suggested_duration_minutes),
        raw_response=suggestion.raw_response,
        created_at=suggestion.created_at,
    )
