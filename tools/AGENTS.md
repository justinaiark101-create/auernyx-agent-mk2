# Mk2 Tools — Codex Rules (Overrides)

## Purpose
Tools exist to prove correctness and generate evidence. They must be deterministic.

## Hard prohibitions
- Do NOT silently ignore errors.
- Do NOT swallow output that would hide failures.
- Do NOT write into git-tracked areas for canon state.
- Do NOT change baseline/proof scripts to “make them pass.”

## Required behavior
- Proof scripts must run in PowerShell 5.1 compatible mode where applicable.
- Baseline PRE/POST must remain mandatory.
- Evidence bundles must be timestamped and hashable.
- Any quoting/escaping must be robust for Windows.

