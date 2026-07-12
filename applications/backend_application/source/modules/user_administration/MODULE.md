# User Administration

Owns administrator-only creation and deactivation of staff accounts and reassignment of drivers between fleet managers. It does not authenticate users or edit driver compliance data.

Public routes are under `/api/admin`. All operations require the `admin` role. Tests belong in `tests/test_user_administration.py`.
