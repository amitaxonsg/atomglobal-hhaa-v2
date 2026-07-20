# Questionnaire reference: supplied `index.html`

Reviewed: 20 July 2026

## Purpose

The supplied `index.html` is the approved behavioural, editorial and questionnaire reference for Head–Heart Alignment. It is a compiled standalone browser bundle and is not copied directly into production.

Production keeps the approved Atom Global presentation and operational platform:

- responsive desktop split screen with the reflective image on the left;
- transparent Atom Global wordmark and warm cream content area;
- editable React source;
- PHP 8.3 API and MariaDB;
- immutable assessment versions;
- autosave and secure resume links;
- Lite and Full reports;
- administration CMS, audit history and access controls.

The attached reference controls the assessment families, public flow, field wording, questions, scoring direction and report source content. It does not replace the approved branding.

## Reference integrity

- File SHA-256: `2626c5f1d1edaf50f4d140b0e93306700cac13c6fcefdff8a107e3b35966c7e8`
- Questionnaire aggregate SHA-256: `379fdc28ddcbafab81af33f07cd8cd7a26364a68c98c5dab610c53087105741b`
- CMS assessment version: `2.0.0`
- Available public assessment families: Personal, New Joiner, Manager and Executive
- Public availability: all four approved cards appear together
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

`tests/js/index-reference.test.mjs` protects the editable questionnaire source. `scripts/export-assessment-reference.mjs` independently verifies these hashes before producing the CMS import payload.

## Public participant flow

1. Display Personal, New Joiner, Manager and Executive together on the right side of the branded split-screen landing page.
2. Read the selected assessment introduction and Heart/Head explanation.
3. Enter name, email, age range and optional gender.
4. Complete five assessment-specific context questions.
5. Configured work roles may reveal Department and Level fields.
6. Accept required privacy and transactional consent; marketing remains optional.
7. Complete 10 autosaved sections of five questions each.
8. Answer each item with a score from 1–5 or a genuine N/A response.
9. Optionally record context beneath each question.
10. Resume an unfinished assessment securely from its private email link.
11. Receive a Lite Report after completion.
12. Access the Full Report only after a verified payment webhook or authorised administrator action.

Production deliberately differs from the browser-only bundle by refusing to trust client-side payment state and by preserving immutable question, answer, scoring and report snapshots.

## Four CMS-linked assessments

All four public cards are backed by active MariaDB assessment tracks and their own published immutable version.

The approved `index.html` content is imported as version `2.0.0` for each track. Before publication, the importer verifies:

- exact section order, code, name and description;
- exact 50 question texts and Head/Heart scoring directions;
- stable question identity and position;
- exact five scored answer choices;
- profile score ranges;
- Lite and Full Report source content;
- exact per-track and aggregate reference hashes.

The importer archives the previously published version only after the new version has passed validation. Existing resume links, completed answers, scores, reports and PDFs remain connected to their original immutable snapshots. New starts use the newly published version.

A database marker prevents ordinary future deployments from overwriting later authorised CMS work. A new approved reference must use a new version and pass the same validation process.

## CMS ownership

**Admin → Questionnaire** manages:

- public landing heading and introduction paragraphs;
- four track-card descriptions;
- track introductions and Lite/Full Report offer wording;
- Heart and Head labels and explanations;
- five participant-context field labels and option lists;
- conditional role triggers, Department and Level fields;
- N/A availability;
- optional answer notes.

**Admin → Content** manages the left-panel stage image, image focal position, overlay, headline and supporting wording.

**Admin → Branding** manages the public logo, colours, typography, radii and related brand assets.

**Admin → Assessments** manages:

- immutable assessment versions;
- 10 sections and 50 questions per track;
- carefully controlled question-text corrections;
- profile score ranges;
- Lite and Full Report content;
- controlled publishing and archival.

## Question editing policy

Question administration is deliberately restricted to protect historical reporting:

- Published and archived versions cannot be edited.
- A draft version may receive text corrections only through the protected correction workflow.
- Allowed corrections are spelling, grammar and clarity changes that do not alter meaning.
- Stable identity, section, position, required/active state and scoring direction remain locked.
- The administrator must confirm that meaning and scoring intent remain unchanged.
- Every correction records previous and revised wording in the audit log.
- A genuinely different question requires a separately reviewed assessment version.

Existing sessions store question and scoring snapshots, and completed assessments store answer, score and report snapshots. Historical reports therefore remain tied to the exact assessment used when they were generated.

## Branding and attribution

Desktop participant pages retain the approved left-image split layout. The image and overlay are driven by CMS stage content, while the content column uses the current brand tokens. Below the responsive breakpoint, the image panel is hidden and the transparent Atom Global logo appears in the content area.

Public participant and report pages do not display the Axon attribution footer. **Powered by Axon 1Pro** remains on the protected admin login and admin sidebar only.

## Attached bundle limitations

The supplied file is a production browser bundle, not an editable source package. By itself it does not include original React components, source maps, backend/API/database code, CMS definitions, tests or deployment files.

Those components remain in V2. The bundle is retained as a cryptographically verified content and process reference, while the production CMS and database provide controlled editing, publishing, history and reporting.
