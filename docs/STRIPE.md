# Stripe

Install dependencies with Composer and configure test credentials first. The frontend asks PHP to create Checkout Sessions; secret keys never reach React. Checkout metadata includes the survey session and affiliate attribution.

Configure Stripe to send events to `/api/stripe/webhook`. The endpoint verifies the signature, stores each event ID under a unique constraint, and processes it idempotently. A successful paid Checkout event updates the payment and unlocks the report. Test duplicate delivery, delayed delivery, refunds and failed processing before live mode.
