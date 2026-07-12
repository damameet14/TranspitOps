# Location Catalog

Owns the database-backed city and state choices used to compose trip source and destination addresses. It exposes authenticated read-only HTTP lookup; administration of the catalog remains a seed/database responsibility.

Public route: `GET /api/locations`. Persistence: `service_locations`.
