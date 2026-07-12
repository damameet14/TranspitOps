"""Suggest a route and persist the suggestion to the database."""

from sqlalchemy.orm import Session

from source.shared_infrastructure.database_models.route_suggestion_model import RouteSuggestion, RouteProvider
from source.modules.route_optimization.route_optimization_contracts import RouteOptimizationRequest
from source.modules.route_optimization.ahmedabad_rule_based_provider import suggest_route_rule_based


def suggest_route_and_persist(
    database_session: Session,
    request: RouteOptimizationRequest,
) -> RouteSuggestion | None:
    """Try the rule-based provider and persist the result.

    Returns the persisted RouteSuggestion, or None if no route was found.
    Future: chain multiple providers (rule_based → Google → fallback).
    """
    result = suggest_route_rule_based(request.source, request.destination)

    if result is None:
        return None

    distance_km, duration_minutes, raw_response = result

    suggestion = RouteSuggestion(
        trip_id=request.trip_id,
        source=request.source,
        destination=request.destination,
        provider=RouteProvider.RULE_BASED,
        suggested_distance_km=distance_km,
        suggested_duration_minutes=duration_minutes,
        raw_response=raw_response,
    )

    database_session.add(suggestion)
    database_session.commit()
    database_session.refresh(suggestion)

    return suggestion
