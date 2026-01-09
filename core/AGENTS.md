# Mk2 Core — Extra-Strict Codex Rules (Overrides)

## Purpose
Core is TRUNK enforcement code. Changes here must preserve correctness over convenience.

## Hard prohibitions
- Do NOT add stubs that always succeed.
- Do NOT add alternate implementations alongside the canonical one.
- Do NOT weaken refusal rules, outcome codes, or write gating.
- Do NOT add “temporary” bypass flags.
- Do NOT change canonical envelope/receipt fields without bumping contract version + proof battery.

## Required behavior
- One authority per concept (single Router, single policy gate, single receipt writer).
- Any change must include:
  - exact files touched
  - invariant(s) preserved
  - verification commands run (`npm run verify` minimum)
  - where evidence/receipts were written

## If uncertain
Refuse and ask for clarification in the commit message, not by guessing.

