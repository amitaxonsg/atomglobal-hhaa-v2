# Report flow audit — 20 July 2026

This document records the verified Lite and Full Report lifecycle.

- Completing all 50 questions creates an immutable score snapshot and separate `free_report_json` and `paid_report_json` snapshots.
- The completion response returns a private report token and the React client immediately loads and displays the Lite Report.
- Locked report responses expose Lite content and an approved upgrade preview only; Full Report content remains server-side.
- Full Report access is unlocked only through a verified Stripe webhook or an authorised admin action.
- Stripe checkout must remain disabled in the participant UI until the secret key, signed webhook secret and the selected track Price ID are all configured.
- Free and paid report source content is versioned in `report_templates` and edited through Admin → Assessments on a cloned draft version. Published assessment/report versions remain immutable.
- Existing generated reports retain their original free and paid snapshots even after a newer assessment version is published.

The production audit and temporary submission smoke test must verify locked-data privacy, Lite content, upgrade preview, Full Report unlock and cleanup without creating a real payment.
