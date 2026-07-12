"""Regression tests for the rule-based route optimization datapoints."""

import unittest

from source.modules.route_optimization.ahmedabad_rule_based_provider import (
    AHMEDABAD_ROUTE_MATRIX,
    suggest_route_rule_based,
)


class RouteOptimizationDatapointTests(unittest.TestCase):
    def test_route_matrix_contains_current_gujarat_datapoints(self):
        self.assertGreaterEqual(len(AHMEDABAD_ROUTE_MATRIX), 19)

    def test_direct_route_returns_configured_distance_and_duration(self):
        result = suggest_route_rule_based("Ahmedabad", "Vadodara")
        self.assertIsNotNone(result)
        distance_km, duration_minutes, metadata = result
        self.assertEqual(112, distance_km)
        self.assertEqual(110, duration_minutes)
        self.assertEqual("rule_based", metadata["provider"])

    def test_reverse_route_uses_the_same_datapoint(self):
        result = suggest_route_rule_based("Vadodara", "Ahmedabad")
        self.assertIsNotNone(result)
        self.assertEqual((112, 110), result[:2])

    def test_location_normalization_supports_whitespace_and_case(self):
        result = suggest_route_rule_based("  AHMEDABAD  ", "surat")
        self.assertIsNotNone(result)
        self.assertEqual((265, 260), result[:2])

    def test_unknown_route_returns_no_suggestion(self):
        self.assertIsNone(suggest_route_rule_based("Mumbai", "Pune"))


if __name__ == "__main__":
    unittest.main()
