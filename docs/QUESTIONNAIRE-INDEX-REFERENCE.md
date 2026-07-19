# Questionnaire reference: supplied `index.html`

Reviewed: 20 July 2026

## Purpose

The supplied `index.html` is the approved behavioural and editorial reference for the Head–Heart Alignment questionnaire. It is not used directly in production because it is a compiled standalone browser bundle. V2 retains editable React source, PHP 8.3, MariaDB, immutable assessment versions, autosave/resume, email, secure Lite/Full reports and the administration CMS.

The approved questionnaire process is displayed inside the established Atom Global visual system: responsive desktop split screen, reflective left image, transparent wordmark, warm cream content area and the existing typography. The reference controls process and wording; it does not replace the approved brand presentation.

## Reference integrity

- File SHA-256: `2626c5f1d1edaf50f4d140b0e93306700cac13c6fcefdff8a107e3b35966c7e8`
- Questionnaire aggregate SHA-256: `379fdc28ddcbafab81af33f07cd8cd7a26364a68c98c5dab610c53087105741b`
- Available assessment families: Personal, New Joiner, Manager and Executive
- Public availability: one selected published assessment at a time
- Sections per assessment: 10
- Questions per assessment: 50
- Scored choices: 1–5
- Additional response: `N/A — doesn’t apply / can’t answer`, excluded from scoring
- Optional note: available beneath each question

Per-track questionnaire hashes:

| Track | SHA-256 |
|---|---|
| Personal | `04735a20df3c46f90cc4135994ce77bd0afaea05b74a00dccbb0998d7a30d3fe` |
| New Joiner | `7d88b84968c090aedf84dd242e3d5f50552a7c9e681613365dfc2592548d8bda` |
| Manager | `cda6be90ab798e9c83369d813328853a28638f9ded68ceb57397130bc3e9aade` |
| Executive | `e43f59c5b3b2739e8a38d604b681af1e1e57cabf93e40fcbe21a3f4f279bfb61` |

`tests/js/index-reference.test.mjs` prevents accidental drift in the editable questionnaire source.

## Preserved participant process

1. The public landing page displays the single assessment selected as live by an administrator.
2. The participant reads the assessment introduction and Heart/Head explanation.
3. The participant enters name, email, age range and optional gender.
4. The participant completes five assessment-specific context questions.
5. Configured work roles may reveal Department and Level fields.
6. Required privacy and transactional consent are accepted; marketing remains optional.
7. The participant completes 10 autosaved sections of five questions each.
8. Each item accepts a scored response from 1–5 or a genuine N/A response.
9. Optional context can be recorded beneath each question.
10. An unfinished assessment can be resumed securely from its private email link.
11. A Lite Report is generated after completion.
12. The Full Report is exposed only after a verified payment webhook or authorised administrator action.

Production deliberately differs from a browser-only bundle by refusing to trust client-side payment state and by preserving immutable question, scoring, answer and report snapshots.

## One live assessment at a time

All four assessment families remain in the administration system. **Admin → Questionnaire → Live assessment** chooses which published assessment is open to new participants.

The control enforces:

- exactly one public assessment at a time;
- an active track with a published version;
- exactly 50 active questions across 10 active sections;
- server-side rejection when a hidden/non-live track is submitted manually;
- an audit entry whenever the live assessment changes.

Changing the live assessment affects new starts only. Existing resume links continue using their original track and version. Completed answers, scores, reports and PDFs remain connected to the immutable snapshots captured for those sessions.

## CMS ownership

**Admin → Questionnaire** manages:

- the single live assessment selector;
- landing heading and introduction paragraphs;
- track-card title prefix and description;
- track introduction and Lite/Full Report offer wording;
- Heart and Head labels and explanations;
- the five participant-context field labels and option lists;
- conditional role triggers, Department and Level fields;
- N/A availability;
- optional answer notes.

**Admin → Content** manages the left-panel stage image, image focal position, overlay, headline and supporting wording.

**Admin → Branding** manages public logo, colours, typography, radii and related brand assets.

**Admin → Assessments** manages:

- immutable assessment versions;
- 10 sections and 50 questions;
- carefully controlled question-text corrections;
- profile score ranges;
- Lite and Full Report content;
- controlled publishing and archival.

## Question editing policy

Question administration is deliberately restricted to protect historical reporting:

- Published and archived versions cannot be edited.
- A draft version may receive **text corrections only**.
- Allowed corrections are spelling, grammar and clarity changes that do not alter meaning.
- Stable identity, section, position, required/active state and scoring direction are locked in the interface and API.
- The administrator must confirm that meaning and scoring intent remain unchanged.
- Every correction records previous and revised wording in the audit log.
- A genuinely different question must never replace an existing question through the correction form.

A material question change requires a separately reviewed assessment version. Existing sessions store question and scoring snapshots, and completed assessments store answer, score and report snapshots. Historical reports therefore remain tied to the exact assessment used when they were generated.

## Branding and attribution

Desktop participant pages use the approved left-image split layout. The image and overlay are driven by CMS stage content, and the content column uses the current brand tokens. Below the responsive breakpoint, the image panel is hidden and the transparent Atom Global logo appears in the content area.

Public participant and report pages do **not** display the Axon attribution footer. **Powered by Axon 1Pro** remains on the protected admin login and admin sidebar only.

## Files not included in the upload

The supplied file is a production bundle, not an editable source package. By itself it does not include:

- original React components or unminified source;
- `package.json`, Vite configuration or source maps;
- separate original image/font assets;
- backend/API/database code;
- CMS definitions;
- tests or deployment files.

These components already exist in the V2 repository. The uploaded file is retained as a verified process and content reference, not copied directly into production.
