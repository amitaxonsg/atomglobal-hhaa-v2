# Head–Heart Alignment V3 — Mobile/Desktop Burn-In Gate

Date: 2 September 2026
Branch: `production-readiness-sunil-mobile-20260902`
Source branch: `sunil-v3-mobile-burnin-20260902`

## Issues being closed before VPS pull

1. Mobile dropdown selection must not increase page/document width.
2. UAT Test — No Payment must remain visible and reachable on narrow mobile reports whenever the server enables `cashOnDeliveryAvailable`.
3. Mobile page/section transitions must not show a load/save failure under normal connectivity.
4. Returning from or cancelling Stripe must not leave the report stuck on `Opening checkout…`.
5. Desktop behaviour must remain unchanged and pass the same end-to-end journey.

## Code hardening applied

- Added strict `min-width: 0`, `max-width: 100%`, box sizing and mobile select constraints to questionnaire containers and native form controls.
- Added 16px mobile input/select font sizing to avoid iOS control zoom/reflow.
- Stacked report payment actions at <=680px so Pay by card and UAT Test — No Payment remain full-width and reachable.
- Added report overflow wrapping for payment notes/errors/report cards.
- Added a report checkout recovery guard which reloads the authoritative server-backed report if a mobile browser returns to a stale disabled `Opening checkout…` state.

## Required burn-in matrix before deployment

### Mobile
- 360px Android-class viewport
- 390/393px iPhone-class viewport
- Personal flow from landing through all 40 questions
- Exercise every intake dropdown and verify `scrollWidth <= clientWidth`
- Verify sections/pages 1 through 10, with special attention to 2 and 3
- Verify autosave state does not block progression
- Verify Lite Report
- Verify UAT Test — No Payment is visible/reachable when enabled
- Verify no-payment unlock and full report
- Verify Stripe open, cancel/return, and second-attempt checkout state
- Verify PDF/open/email actions

### Desktop
- 1366px or greater viewport
- Repeat complete Personal 40-question flow
- Verify no regression in intake layout, section navigation, Lite Report, UAT no-payment, Stripe and Full Report

## Release gate

Do not pull to VPS until automated readiness checks pass and both mobile and desktop burn-in are recorded PASS with no Critical/High open defects.
