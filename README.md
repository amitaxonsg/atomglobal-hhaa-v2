# Head-Heart Alignment V2

Editable React/Vite source for Atom Global Consulting's Head-Heart Alignment assessment.

## Development

```bash
npm ci
npm run dev
```

## Production build

```bash
npm run build
```

Vite writes production files to `dist/`. Netlify uses `netlify.toml` to publish that directory and routes browser refreshes back to the React entry point.

## Project structure

- `src/components/AssessmentApp.jsx` contains the assessment screens and report presentation.
- `src/data/assessmentData.js` contains every track, question, profile, result narrative, and scoring helper.
- `public/` contains Atom Global artwork, installable-app metadata, icons, and the service worker.

The Personal, New Joiner, Manager, and Executive tracks all use the same scoring model as the previous compiled application. Reverse-scored answers are normalized before total and subscale scores are calculated.
