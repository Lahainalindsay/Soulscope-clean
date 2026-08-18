# SoulScope Frontend

This frontend ports the Replit SoulScope instrument visual language into the
existing Next.js shell and connects it to the current
canonical backend path. It supports Supabase Auth, owner-scoped scan creation,
browser microphone recording, private backend processing, and owner-only
structural Dimension result display.

It does not perform scientific scoring, state inference, interaction inference,
pattern inference, narrative generation, or production Resonance Signature
rendering.

It uses Next.js `14.2.35`, React `18.3.1`, TypeScript, CSS Modules, semantic HTML, and the local `@soulscope/canonical-contracts` package for approved labels and identifiers. Replit visual assets are retained under `public/soulscope/`.

The original archived frontend used Next.js `14.2.5`; this clean shell pins the latest `14.2.x` patch because the `14.2.5` native compiler crashed during production build validation in this environment.

## Scope

Included:

- responsive application shell
- navigation
- design tokens
- scan-screen browser recording
- analyzing-screen backend processing
- results demo layout
- owner-only structural result route
- history, profile, and settings presentation
- visual-only Resonance Signature placeholder
- structural Resonance Signature using only canonical eligibility/status data
- accessibility and reduced-motion foundations

Excluded:

- client-side acoustic analysis
- scoring
- state selection
- interaction inference
- pattern inference
- narrative generation
- production renderer behavior

The imported Expo app's `analysis.ts`, Replit `api-server`, workspace API
client, Replit authentication, database, and server runtime are deliberately
excluded. The browser submits only authenticated multipart audio to the
existing `/process-scan` FastAPI route; it never uses privileged Supabase
credentials or direct scientific/scoring logic.

## Required Runtime Environment

Client-safe frontend variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SOULSCOPE_BACKEND_URL`

Backend/service variables must never be exposed to browser JavaScript:

- `SUPABASE_SERVICE_ROLE_KEY`
- `SOULSCOPE_WORKER_INTERNAL_TOKEN`, if configured

The backend that receives `NEXT_PUBLIC_SOULSCOPE_BACKEND_URL` must be configured
with Supabase service credentials and `SOULSCOPE_STORAGE_BACKEND=supabase` for
staging/private-audio processing. Set `SOULSCOPE_ALLOWED_ORIGINS` on the backend
to the deployed frontend origin.
