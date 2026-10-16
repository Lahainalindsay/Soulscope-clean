# Opt-in transcript reflection v2

SoulScope Canon Set v2.0 remains the authority for acoustic meaning. This path is a separately labeled interpretation of the **words the user spoke**; it does not turn provisional acoustic measurements into psychological states, Dimension scores, Constellation states or a Signature. The sealed v1 semantic result remains unchanged and unresolved. Older scans cannot be silently transcribed or reinterpreted.

## Flow

1. A separate unchecked checkbox on the review step records consent version `transcript-reflection-v1` with the scan. Without it, processing remains acoustic-only.
2. After acoustic quality qualification, the Python worker sends each of the three WAV captures to the hosted OpenAI transcription API. It saves the returned text privately under the scan owner and capture ID. Provider errors do not corrupt the acoustic pipeline.
3. Once the canonical result is finalized, the internal worker-token endpoint builds a v2 content reflection from the three saved transcripts. It never sends feature scores to the language model. Short speech, missing capture text or poor audio yields `UNRESOLVED`. Missing configuration leaves the option unavailable.
4. JSON has overview, cognition, relationships, expression and question arrays. Each sentence carries exact quoted spans and zero-based Unicode codepoint offsets into a capture transcript. Unsupported domains can be empty. Python, a database insert trigger and the owner-authenticated consumer independently check exact quote membership. Quote matching prevents fabricated *citations*, not incorrect interpretation; participant evaluation is still required.
5. The owner sees the saved v2 reading through `/api/results/[id]/reflection`. When no valid v2 reading is present, the existing recording description is retained. Feedback is stored as accurate / partly / missed me, with owner-scoped RLS.

## Activation and limits

The backend needs `OPENAI_API` on its Vercel project. The frontend checks the protected worker availability endpoint; it does not show the opt-in checkbox until that key exists. Set a budget and verify provider terms and deletion settings before activation. The browser receives neither the API key nor the service-role key.

The runtime uses `gpt-4o-mini-transcribe` for transcription and `gpt-4o` with strict JSON Schema for writing. Each capture is sent separately. Transcription can be wrong; citation checks establish transcript membership rather than audio truth. A fluent sentence may overinterpret a real quote. Before calling the reading accurate, evaluate consented participant ratings and human reviews by claim, device, language, content and recording quality. Do not use feedback ratings as automatic psychological labels. The current protocol does not guarantee material for every domain in every scan.

The additive migration is `20261016123817_transcript_grounded_reflection_v2.sql`; it was applied to SoulScope Clean staging through Supabase on October 16, 2026. Three new tables use RLS and explicit grants. No existing result was rewritten.
