import type { RouterContext } from "../core/router";

export interface AnalyzeDependencyInput {
    packageManager?: "npm" | "pnpm" | "yarn";
    packageName?: string;
    fromVersion?: string;
    toVersion?: string;
    pullRequest?: {
        number?: number;
        title?: string;
        body?: string;
        files?: string[];
    };
}

export interface AnalyzeDependencyResult {
    summary: string;
    riskLevel: "low" | "medium" | "high" | "unknown";
    autoApproveEligible: boolean;
    evidence: string[];
    checks: {
        sourceMetadata: "todo" | "pass" | "fail";
        securityAdvisories: "todo" | "pass" | "fail";
        breakingChanges: "todo" | "pass" | "fail";
        trustScore: "todo" | "pass" | "fail";
    };
    integrationPoints: {
        npmApi: string;
        securityFeed: string;
        changelogParsing: string;
        ledgerReceipts: string;
        policyGate: string;
    };
    notes: string[];
}

function parseInput(input: unknown): AnalyzeDependencyInput {
    if (!input || typeof input !== "object") return {};
    return input as AnalyzeDependencyInput;
}

// Auernyx Mk2 - Dependency Analysis Capability scaffold
// Governed, receipt-backed, policy-enforced dependency review.
export async function analyzeDependency(ctx: RouterContext, input?: unknown): Promise<AnalyzeDependencyResult> {
    const parsed = parseInput(input);

    const pkg = parsed.packageName ?? "(unresolved)";
    const from = parsed.fromVersion ?? "(unknown)";
    const to = parsed.toVersion ?? "(unknown)";

    if (ctx.ledger) {
        ctx.ledger.append(ctx.sessionId, "dependency.analysis.scaffold.invoked", {
            packageName: pkg,
            fromVersion: from,
            toVersion: to,
            packageManager: parsed.packageManager ?? "npm"
        });
    }

    return {
        summary: `Scaffold analysis for ${pkg} ${from} -> ${to}.`,
        riskLevel: "unknown",
        autoApproveEligible: false,
        evidence: [
            "TODO: Pull package metadata (npm registry API)",
            "TODO: Pull advisories (GitHub Advisory DB / OSV / npm audit)",
            "TODO: Parse release notes/changelog and identify breaking signals",
            "TODO: Compute governed risk score + trust score"
        ],
        checks: {
            sourceMetadata: "todo",
            securityAdvisories: "todo",
            breakingChanges: "todo",
            trustScore: "todo"
        },
        integrationPoints: {
            npmApi: "Insert package metadata + dist-tag lookup in capabilities/analyzeDependency.ts",
            securityFeed: "Insert advisory enrichment in capabilities/analyzeDependency.ts",
            changelogParsing: "Insert release note parsing and semver diffing in capabilities/analyzeDependency.ts",
            ledgerReceipts: "Emit additional ledger.append() evidence events per check",
            policyGate: "Keep capability read-only; policy can gate auto-approval in workflow"
        },
        notes: [
            "Designed for 3-worker implementation: metadata, security, compatibility.",
            "Read-only by default; intended for Dependabot PR analysis.",
            "Workflow integration file: .github/workflows/auernyx-dependency-review.yml"
        ]
    };
}
