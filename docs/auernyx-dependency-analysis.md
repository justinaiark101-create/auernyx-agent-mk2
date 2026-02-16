# Auernyx Dependency Analysis Capability

## Purpose

`analyzeDependency` is a read-only capability scaffold that provides the integration surface for governed analysis of dependency upgrades (primarily Dependabot pull requests).

## Current behavior

- Accepts optional dependency context input (package name, versions, PR metadata).
- Emits a ledger event (`dependency.analysis.scaffold.invoked`) when ledger context is available.
- Returns scaffold placeholders for:
  - source metadata collection
  - security advisory checks
  - breaking-change detection
  - trust scoring/risk scoring

## Integration points

All integration points are intentionally centralized in `capabilities/analyzeDependency.ts`:

1. **npm API calls**
   - Fetch package metadata, dist-tags, publish times, maintainers.
2. **Security checks**
   - Query GHSA / OSV / npm advisory surfaces.
3. **Breaking change detection**
   - Compare semver delta and parse release notes/changelog.
4. **Risk scoring**
   - Weighted score + confidence value, mapped to low/medium/high.
5. **Ledger evidence**
   - Append one event per completed check for hash-chained auditability.

## Router and policy wiring

- Router intent mapping: phrases containing both `analyze` and `dependency` route to `analyzeDependency`.
- Policy classification: tier `0`, `readOnly: true`.
- Allowlist: `config/allowlist.json` includes `analyzeDependency`.

## Workflow integration

The GitHub workflow `.github/workflows/auernyx-dependency-review.yml` compiles Auernyx and invokes the scaffold capability for Dependabot PRs, then comments integration pointers in the PR.

## Recommended 3-LLM sprint split

- Worker A: registry + metadata/changelog ingestion
- Worker B: security advisory enrichment + severity normalization
- Worker C: compatibility/breaking-change heuristics + trust score

Orchestrate outputs into a final governed verdict with explicit evidence fields.
