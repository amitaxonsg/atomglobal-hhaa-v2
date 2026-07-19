# Questionnaire reference: supplied `index.html`

Reviewed: 19 July 2026

## Purpose

The supplied `index.html` is treated as the approved behavioural and editorial reference for the Head–Heart Alignment questionnaire. It is not used as the production application because it is a compiled, standalone browser bundle. The V2 production platform keeps the editable React source, PHP API, MariaDB records, immutable assessment versions, autosave/resume, email queue, secure Lite/Full report controls and administration CMS.

## Reference integrity

- File SHA-256: `2626c5f1d1edaf50f4d140b0e93306700cac13c6fcefdff8a107e3b35966c7e8`
- Questionnaire aggregate SHA-256: `379fdc28ddcbafab81af33f07cd8cd7a26364a68c98c5dab610c53087105741b`
- Tracks: Personal, New Joiner, Manager and Executive
- Sections per track: 10
- Questions per track: 50
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

1. Select one of the four assessment tracks.
2. Read the track introduction and the Heart/Head explanation.
3. Enter name, email, age range and gender.
4. Complete five track-specific context questions.
5. Accept required privacy and transactional communication consent; marketing remains optional.
6. Complete 10 autosaved sections of five questions each.
7. Choose a scored response from 1–5 or mark a genuinely irrelevant question N/A.
8. Optionally add context beneath any question.
9. Receive the Lite Report after completion.
10. Unlock the Full Report only after a verified payment webhook or an authorised administrator action.

The final point deliberately differs from the static reference bundle: production never trusts a browser-only payment state and never reveals paid content before server-side verification.

## CMS ownership

**Admin → Questionnaire** manages:

- track introduction heading and copy;
- Lite/Full report offer wording;
- Heart and Head labels and explanations;
- the five participant-context field labels and option lists;
- whether N/A is available;
- whether optional notes are available.

**Admin → Assessments** manages:

- immutable assessment versions;
- 10 sections and 50 questions;
- question wording and scoring direction;
- the five scored answer labels;
- profile score ranges;
- Lite and Full report content.

Published versions remain immutable. Editors clone a version, make changes in draft, review it and publish only after approval. Existing sessions and reports remain pinned to their original question/scoring snapshots.

## Branding

The imported process uses the existing V2 branding rather than copying styling from the compiled bundle. The approved warm cream canvas, Atom Global wordmark, current typography, stage imagery, responsive split-screen layout and Powered by Axon 1Pro attribution remain unchanged.

## Files not included in the upload

The single uploaded file is a production bundle, not an editable source package. By itself it does not include:

- original React components or unminified source;
- `package.json`, Vite configuration or source maps;
- separate image/font assets embedded or referenced by the build;
- `manifest.json` and `icon-192.png`, although the HTML references them;
- backend/API/database code;
- CMS definitions;
- tests or deployment files.

These are not missing from the V2 repository: the repository already contains editable frontend source, public PWA assets, PHP/MariaDB backend, CMS, tests and immutable deployment tooling. The uploaded file is retained only as a verified reference, not copied into production.
