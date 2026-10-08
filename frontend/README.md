# SoulScope frontend

Next.js App Router frontend for the clean rebuild. Shares the canonical three-prompt registry from `packages/canonical-contracts`; does not copy the archived application.

## Run

From the repository root:

```sh
npm --prefix frontend ci
npm run dev
```

Open http://localhost:3000. `/results` is an explicitly labeled, illustrative design preview. Recording, playback, and WAV conversion work locally without account configuration. Live submission needs the staging configuration below.

```sh
npm run typecheck
npm run test:frontend
npm run build
npm run test:contracts
PYTHONPATH=backend python3 -m unittest discover -s backend/tests -t backend
```

## Connect the staging backend

Copy `frontend/.env.example` to `frontend/.env.local` and supply:

| Variable | Scope | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Browser + server | Existing Supabase staging project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Browser + server | Publishable key; legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY` is supported |
| `SOULSCOPE_BACKEND_URL` | Server only | HTTPS address of the deployed Python/FastAPI worker |
| `SOULSCOPE_WORKER_INTERNAL_TOKEN` | Server only | Same nonempty internal token configured on that worker |

Never place the Supabase service-role key in the frontend. The Python worker retains its existing service credentials. Browser queries and server ownership checks use the user's access token and the existing RLS policies.

Prerequisites:

1. Apply the existing repository migrations to a staging project. Ensure Data API grants and schema exposure match the migrations.
2. Configure and run the worker following `backend/README.md`, with private storage and a nonempty internal token. Protect its internal routes from public access where possible.
3. Activate an approved canonical three-prompt set. The foundation seeds `launch-v1` as **draft**. The UI rejects inactive/incomplete/incompatible prompt sets instead of silently substituting wording.
4. Configure Supabase Auth site/confirmation redirect URLs to include `/account` on the frontend origin. Sign in with a staging user.
5. Schedule backend audio cleanup if enforcing the 24-hour retention window. This frontend does not claim the cleanup helper is scheduled. Staging consent discloses that automatic raw-audio deletion is not guaranteed and derived records persist.
6. Record three responses, listen back, then submit. Measurements, evidence, and unresolved dimension records appear at `/results/<scan-id>` and in `/history`.

## Vercel

Import `Lahainalindsay/Soulscope-clean`, set **Root Directory = `frontend`**, framework **Next.js**, and **Node.js 24.x**. Enable **Include source files outside of the Root Directory in the Build Step** so the canonical package is available. Use the standard install/build commands (`npm ci`, `npm run build`) and add the four variables above to the appropriate environment. Public variables are baked into the build; redeploy after changing them. The backend needs its own Python runtime; Vercel does not run the worker from this frontend.

Three 30-second mono 16 kHz WAVs total roughly 2.9 MB, below Vercel's usual request-body limit. Route `maxDuration` is 300 seconds; confirm the chosen plan supports the worker duration. Longer processing should move to a durable queue before a production launch.

## Routes

| Route | Function |
| --- | --- |
| `/` | Home, product context, canonical prompts |
| `/scan` | Consent, three recordings, playback, retry, review, submit |
| `/results` | Illustrative visual/copy preview; never persisted as a result |
| `/results/[id]` | Owner-readable measurements/evidence/unresolved dimensions |
| `/history` | Up to 100 recent owner-readable scans |
| `/field` | Saved moment count and honest longitudinal empty state |
| `/account` | Supabase email/password signup, signin, signout |
| `/about` | Method, interpretation limits, staging privacy disclosure |
| `/api/process` | Authenticated, bounded server-to-worker orchestration |

## Processing boundary

The browser uses the active canonical prompt set, creates an owner-scoped scan, creates capture workflow rows, and requests bounded lifecycle transitions using the existing RPC. Consent acknowledgment and disclosure version are attached to the capturing transition audit details.

The server verifies the access token with Supabase Auth, checks scan ownership through RLS, checks canonical capture IDs/order/status, and validates the actual WAVs before privileged processing. The worker token never enters client code. The server invokes the existing measurement, evidence, dimension, and canonical completion endpoints in order. Completion requires the backend canonical-result migration. Retry discovers saved stages by their upstream immutable IDs and resumes without rerunning completed stages. Upstream error bodies are not echoed to the browser.

A submitted measurement test remains `extracting` in the foundation scan lifecycle because the worker has not published/finalized a canonical result. The UI reports saved evidence separately from that lifecycle. No frontend code forces finalization.

Recordings are in page memory, not localStorage or public storage. Leaving the scan page stops the microphone and releases object URLs. After submitting, retry is possible while the page remains open. Abandoned sessions remain visible in history; deletion/cancellation management is future work.

## Scientific scope

Current backend outputs are descriptive provisional measurements, structural evidence, abstained/unresolved dimensions, and immutable completed semantic results with `CALIBRATION_REQUIRED`. There is no calibrated constellation scoring, state/pattern inference, interpretation engine, integrated longitudinal field, or canonical time-resolved acoustic renderer.

The luminous SVG is decorative, fixed artwork. It is never driven by constellation scores, never presented as a measured Resonance Signature, and never persisted as a rendering record. Future production rendering must obey Canon v1.3's time-as-radius, acoustic-only provenance boundary. The requested reference is an aesthetic reference, not an inference contract.

The preview presents a human-language interpretation, three sentence-length daily-life possibilities, and a balance-oriented question. It also preserves the other canonical narrative section placeholders. These are isolated illustrative copy. Live unresolved results cannot receive the preview text.

## Validation of this implementation

- Production Next.js build and strict TypeScript check.
- Nine frontend tests covering PCM encoding, unavailable-versus-zero display, rejected recordings, authenticated ownership, capture mismatch, sequential worker IDs, resumable processing, idempotency, and sanitized failures.
- Existing canonical and Python backend checks.
- Browser checks across all seven screens at 1440px and 390px: no horizontal overflow or JavaScript exceptions; rendered results and mobile recording screens visually reviewed.
- Browser recording test using Chromium synthetic microphone input: three recordings, WAV conversion, playback, three-response review, and a safe 503 response when submission is unconfigured.
- No hosted staging credentialed pipeline verification was possible in the implementation workspace; environment variables were absent.
