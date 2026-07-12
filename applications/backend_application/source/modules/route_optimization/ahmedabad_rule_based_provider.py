"""Rule-based route suggestion provider for Ahmedabad-area routes.

This is the v1 "smart" provider that uses a hardcoded distance/duration
matrix for common Ahmedabad and Gujarat routes. It returns instant suggestions
without any external API call.

Future providers (Google Maps, etc.) will implement the same interface.
"""

import math

# Distance matrix: (source, destination) → (distance_km, duration_minutes)
# Distances are approximate road distances. Duration assumes 40 km/h average in city,
# 60 km/h on highway.
AHMEDABAD_ROUTE_MATRIX: dict[tuple[str, str], tuple[float, float]] = {
    # Intra-city
    ("ahmedabad", "gandhinagar"): (25, 40),
    ("ahmedabad west", "ahmedabad east"): (12, 30),
    ("sg highway", "satellite"): (8, 20),
    ("ahmedabad", "bopal"): (15, 35),
    ("ahmedabad", "sanand"): (25, 45),
    ("ahmedabad", "naroda"): (18, 40),

    # Inter-city Gujarat
    ("ahmedabad", "vadodara"): (112, 110),
    ("ahmedabad", "rajkot"): (215, 210),
    ("ahmedabad", "surat"): (265, 260),
    ("ahmedabad", "bhavnagar"): (170, 180),
    ("ahmedabad", "junagadh"): (320, 300),
    ("ahmedabad", "jamnagar"): (305, 290),
    ("ahmedabad", "mehsana"): (75, 80),
    ("ahmedabad", "anand"): (75, 75),
    ("ahmedabad", "bharuch"): (190, 180),
    ("gandhinagar", "rajkot"): (205, 200),
    ("gandhinagar", "ahmedabad"): (25, 40),
    ("vadodara", "surat"): (155, 150),
    ("rajkot", "surat"): (340, 330),
    ("rajkot", "jamnagar"): (90, 90),
}


def _normalize_location(location: str) -> str:
    """Normalize a location name for matrix lookup."""
    return location.strip().lower()


def suggest_route_rule_based(
    source: str,
    destination: str,
) -> tuple[float, float, dict] | None:
    """Look up a route in the Ahmedabad route matrix.

    Args:
        source: Starting location name.
        destination: Ending location name.

    Returns:
        A tuple of (distance_km, duration_minutes, raw_response) if found,
        None if the route is not in the matrix.

    The raw_response dict contains the lookup metadata for transparency.
    """
    normalized_source = _normalize_location(source)
    normalized_destination = _normalize_location(destination)

    # Direct lookup
    key = (normalized_source, normalized_destination)
    if key in AHMEDABAD_ROUTE_MATRIX:
        distance_km, duration_minutes = AHMEDABAD_ROUTE_MATRIX[key]
        return distance_km, duration_minutes, {
            "provider": "rule_based",
            "lookup_key": f"{normalized_source} → {normalized_destination}",
            "note": "Direct match from Ahmedabad route matrix",
        }

    # Reverse lookup (same distance, same duration)
    reverse_key = (normalized_destination, normalized_source)
    if reverse_key in AHMEDABAD_ROUTE_MATRIX:
        distance_km, duration_minutes = AHMEDABAD_ROUTE_MATRIX[reverse_key]
        return distance_km, duration_minutes, {
            "provider": "rule_based",
            "lookup_key": f"{normalized_destination} → {normalized_source} (reverse)",
            "note": "Reverse match from Ahmedabad route matrix",
        }

    # Partial match — check if source or destination contains a known city
    for (matrix_src, matrix_dst), (dist, dur) in AHMEDABAD_ROUTE_MATRIX.items():
        if (matrix_src in normalized_source or normalized_source in matrix_src) and \
           (matrix_dst in normalized_destination or normalized_destination in matrix_dst):
            return dist, dur, {
                "provider": "rule_based",
                "lookup_key": f"{matrix_src} → {matrix_dst} (partial match)",
                "note": "Partial match — actual distance may differ",
            }
        if (matrix_dst in normalized_source or normalized_source in matrix_dst) and \
           (matrix_src in normalized_destination or normalized_destination in matrix_src):
            return dist, dur, {
                "provider": "rule_based",
                "lookup_key": f"{matrix_dst} → {matrix_src} (partial reverse match)",
                "note": "Partial reverse match — actual distance may differ",
            }

    return None
