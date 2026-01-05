# Milestone — 2026-01-05

## Frozen anchors

- Trunk contract anchor: `yggdrasil-trunk@v1`
  - Meaning: contract law is frozen; changes require an explicit version bump.

- Kotlin consumer anchor: `yggdrasil-kotlin-consumer@v1`
  - Meaning: Kotlin verifier/receipt emitter v1 is locked and reproducible.

## What was achieved

- Kotlin consumer sweep v1 under `branches/kotlin-consumer/`:
  - Strict envelope parsing
  - Canonical payload digest verification (SHA-256)
  - Locked decision/refusal codes
  - Governance receipt emission + deterministic JSON + receipt hash
  - Passing proof battery (`gradlew test`)

- Hostile test branch `branches/kotlin-consumer-hostile`:
  - Digest-fuzzer stress test that exists only to fail if refusal logic weakens

## Boring verification hooks

- VS Code task: Kotlin Proof Battery
- VS Code task: Kotlin CLI Preview Run

## Closeout drill

- Baseline POST at end of workday and record SHA-256 in `docs/baseline-records.md`
- SHA-256 verify smoke entrypoint (tools/smoke-topdown.ps1)
- Push branches and tags before closeout
