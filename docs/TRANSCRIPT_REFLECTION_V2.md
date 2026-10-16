# Voice-led reflection v2

The same saved v2 reading path now supports `mode: VOICE_AND_WORDS`. The sealed Canon v1 semantic result remains unchanged. This is an experimental, participant-rated perception of vocal expression combined with spoken content, not a calibrated psychological publication.

## One producer, two inputs

1. The unchecked scan consent explicitly covers hosted direct listening, transcription and reading. It records both existing transcription consent and an owner-scoped `voice_reflection_consents` row, version `voice-reflection-v1`. Existing scans require an explicit checkbox on their result before new direct-listening processing. No legacy recording is silently upgraded.
2. Acoustic extraction remains the existing Python worker. It retains voice measurements and quality gates. After finalization the reflection producer reads only the scan's private WAV artifacts, verifies SHA-256, mono 16 kHz PCM format, duration and prompt linkage, and sends the actual audio bytes to `gpt-audio-1.5` with `modalities: [text]` and `store: false`. This is direct audio input, not a transcript pretending to be audio analysis.
3. The listener describes audible delivery and possible everyday vocal impressions across all three recordings. It cannot diagnose, infer personality or hidden motives, assign scores, or turn pitch into an emotion. The saved `voice_observation_records` snapshot includes full-capture artifact provenance, not invented timestamps. Perceptual accuracy still needs participant evaluation.
4. `gpt-4o` writes overview, cognition, relationships, expression and a question from the listening snapshot and transcript. Each sentence cites `audioRefs`, exact transcript `sourceSpans`, or both. Overview and any expression section must include voice evidence. Cognition and relationships require words. Unsupported sections are empty. The writing direction reuses the original SoulScope idea of contrasting responses and giving one coherent reflection; none of its missing-value defaults, weighted emotion formulas, score bands, or parallel decision engines are imported.
5. Source validation happens in Python, the database insert trigger and the owner-authenticated frontend consumer. Invalid generations get up to two bounded rewrites. Provider failure does not save a fabricated reading. A retry resumes saved listening evidence and can recover missing transcripts from the same private audio; it does not ask the user to record again. Feedback remains accurate / partly / missed me.

## Activation and operations

The backend Vercel project uses `OPENAI_API`. Availability checks both configuration and access to the audio model. The browser receives no provider key or service-role key. Audio/transcript content is not logged. Provider failures log only scan ID, error type and HTTP status.

The additive migration is `20261016220032_voice_led_reflection.sql`. New tables use RLS, explicit grants and source-validation triggers. Ordinary clients can give their own consent and read their own listening observations, but cannot write observations or readings. The original v1 and earlier saved v2 results are not rewritten. The new mode stays within the existing v2 result and feedback tables.

## Evaluation boundary

Software tests verify audio transport, checksum/capture integrity, consent, source membership, ownership and rendering. They cannot prove an emotion or interpretation is true. The beta reading asks participants to rate their own consented scan; it must not be marketed as a validated emotional assessment. Before promoting acoustic meaning into the Canon path, use participant-held-out evaluation, independent ratings, speech/device/language confounds and published abstention criteria. A citation to sound establishes which recording was considered, not that a psychological interpretation follows from it.

Official audio input format: https://developers.openai.com/api/docs/guides/audio-chat-completions
