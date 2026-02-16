# Dependency Review Integration Guide

## Components added

- `.github/dependabot.yml` (weekly schedule, PR cap 3)
- `.github/CODEOWNERS` (owner-gated governance surfaces)
- `.github/workflows/dependabot-auto-merge.yml` (Dependabot auto-merge guardrails)
- `.github/workflows/auernyx-dependency-review.yml` (Auernyx scaffold invocation)
- `.github/PULL_REQUEST_TEMPLATE/dependabot.md` (review checklist)
- `capabilities/analyzeDependency.ts` (analysis scaffold)

## End-to-end flow

1. Dependabot opens PR.
2. `auernyx-dependency-review` workflow runs and invokes `analyzeDependency` scaffold.
3. Workflow posts review guidance comment.
4. Human reviewers apply checklist and governance evidence.
5. Optional auto-merge applies only to low-risk patch-style Dependabot updates.

## Next implementation steps

1. Replace scaffold TODOs with real API clients and parsers.
2. Add deterministic scoring rubric under `config/` and enforce via policy.
3. Extend workflow to parse capability JSON output and block PRs on high-risk verdicts.
4. Emit structured receipt links in PR comments.
5. Add test fixtures for known dependency upgrade scenarios.
