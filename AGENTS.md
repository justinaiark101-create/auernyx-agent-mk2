# Auernyx Agent Mk2 — Codex Instructions (Trunk Law)

## Non-negotiable model
- Mk2 is the TRUNK. It defines governance contracts and integrity rules.
- Branches may fail. The trunk must not lie.
- Never introduce silent "always succeeds" stubs, bypasses, or fake execution paths.

## Baseline discipline (required)
- Baseline PRE is required at the start of a work session.
- Baseline POST is required once at session closeout (end-of-day or explicit freeze).
- Baseline is NOT required for every individual edit or comment.
- Session closeout implies:
  - baseline POST
  - SHA-256 recorded
  - git commit + push

## Write gating / safety
- Never weaken AUERNYX_WRITE_ENABLED + explicit arming gates.
- Default must remain preview-only unless explicitly armed.
- If a change would reduce auditability or correctness: refuse and explain.

## Module system policy (Option C: dual output)
This repo MUST preserve runtime/build alignment and support BOTH:
- CommonJS output (for Node + VS Code extension compatibility)
- ESM output (for modern consumers)

Do not change module settings in one place without updating the full matrix:
- package.json ("type", "exports")
- tsconfig(s) emit targets
- build scripts
- runtime entrypoints
- verification scripts

## Required deliverables for any module-system or build change
- Build outputs:
  - dist/cjs/** (CommonJS)
  - dist/esm/** (ESM)
- package.json exports map must route:
  - import -> ESM
  - require -> CJS
- A verification command must pass:
  - typecheck
  - build both outputs
  - run CLI from each output (or a minimal --help smoke)
- No breaking changes to trunk tags without a new tag + proof battery + evidence bundle.

## Editing rules
- Prefer minimal, deterministic changes.
- Never leave duplicate competing implementations (one authority per concept).
- If there is ambiguity about which implementation is used: resolve it now.

## How to proceed on tasks
When asked to implement anything:
1) Identify files touched
2) State the invariant(s) you are preserving
3) Propose patch
4) Run verify commands
5) Summarize results + where evidence is stored


Why this works: Codex automatically reads AGENTS.md files before doing any work, and it layers instructions from global + repo scope.
