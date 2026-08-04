# Stripe Connect and USD pricing

## Scope

This change adds an easier **Connect with Stripe** path for the Atom Global Head–Heart Alignment administration portal while preserving the complete existing manual Stripe setup.

The payment lifecycle remains unchanged:

- Stripe-hosted Checkout;
- Lite Report before payment and automatic Full Report unlock after verified payment;
- signed webhook processing;
- successful, asynchronous, failed and expired checkout handling;
- refunds relock the report and void affiliate commission;
- payment and paid-report email queueing;
- affiliate attribution and commission records;
- existing manual test/live API key and Price ID fields.

All report prices managed by the new setup are one-time **USD** prices.

## VPS environment values

Add these only to the protected production environment file. Never place them in Git, screenshots, email or feedback records.

```dotenv
STRIPE_CONNECT_CLIENT_ID=ca_...
STRIPE_PLATFORM_SECRET_KEY=sk_test_...   # use the matching live key only for live Connect
STRIPE_CONNECT_REDIRECT_URI=https://head-heart.atomglobal.com/api/stripe/connect/callback
STRIPE_CONNECT_WEBHOOK_SECRET=whsec_...
```

The callback URL must also be registered in the Stripe Connect platform settings.

## Stripe webhook

Create a Connect webhook that listens to **Events on connected accounts** and points to:

```text
https://head-heart.atomglobal.com/api/stripe/webhook
```

Subscribe to:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`
- `checkout.session.expired`
- `charge.refunded`
- `account.application.deauthorized`

Keep the existing account webhook and manual webhook secret when manual fallback is still required.

## Administrator workflow

1. Open **Administration → Settings → Stripe**.
2. Select **Connect with Stripe**.
3. Sign in to the client Stripe account and approve access.
4. Return to the administration portal automatically.
5. Confirm the Personal, New Joiner, Manager and Executive prices in USD.
6. Select **Create or update Stripe prices**.
7. Select **Test connection**.
8. Complete one test-mode Checkout and verify the signed webhook, payment record, Full Report unlock and emails.

The application creates or reuses one product per assessment track and stores separate connected-account Price IDs. Manual Price IDs are not overwritten.

## Deployment gate

Do not deploy automatically. Before pulling to the VPS:

1. confirm GitHub checks pass;
2. back up MariaDB and the Head–Heart Apache site configuration;
3. pull the exact approved commit;
4. build and run PHP/JavaScript tests;
5. configure the protected environment values;
6. test in Stripe test mode;
7. verify the existing Sunil questionnaire, reports, email, affiliate and Apache media behaviour remains unchanged;
8. switch to live Stripe credentials only after client acceptance.
