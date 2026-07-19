# API

Public endpoints include `GET /api/health`, `GET /api/csrf`, `POST /api/survey-sessions`, `PATCH /api/survey-sessions/{id}`, `POST /api/survey-sessions/{id}/complete`, `GET /api/reports/{token}`, `POST /api/payments/checkout`, and `POST /api/stripe/webhook`.

Administration endpoints are under `/api/admin`. They use secure HttpOnly session cookies and CSRF headers for state-changing requests. JSON is the request and response format. Public write endpoints should also be protected by configured rate limits and Turnstile where enabled.
