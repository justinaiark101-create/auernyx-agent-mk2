import type { RouterContext } from "../core/router.js";
import { listKnownGood } from "../core/knownGood.js";
import { verifyLedgerIntegrity } from "../core/integrity.js";
import { getKintsugiPolicy, policyHash, verifyKintsugiIntegrity } from "../core/kintsugi/memory.js";
import { listKnownGoodSnapshotsWithPaths } from "../core/kintsugi/knownGood.js";

export async function memoryCheck(ctx: RouterContext, input?: unknown): Promise<unknown> {
    const maxEntries = typeof (input as any)?.maxEntries === "number" ? (input as any).maxEntries : undefined;
    const mk2Integrity = verifyLedgerIntegrity(ctx.repoRoot, { maxEntries });
    const mk2KnownGoodCount = listKnownGood(ctx.repoRoot).length;

    const kintsugiIntegrity = await verifyKintsugiIntegrity(ctx.repoRoot);
    const kintsugiPolicy = getKintsugiPolicy(ctx.repoRoot);
    const kintsugiPolicyHash = policyHash(kintsugiPolicy);
    const kintsugiKnownGoodCount = (await listKnownGoodSnapshotsWithPaths(ctx.repoRoot)).length;

    return {
        ok: mk2Integrity.ok && kintsugiIntegrity.ok,
        mk2: {
            ok: mk2Integrity.ok,
            warnings: mk2Integrity.warnings,
            checkedEntries: mk2Integrity.checkedEntries,
            lastHash: mk2Integrity.lastHash,
            knownGoodSnapshots: mk2KnownGoodCount,
        },
        kintsugi: {
            ok: kintsugiIntegrity.ok,
            warnings: kintsugiIntegrity.warnings,
            policy: kintsugiPolicy,
            policyHash: kintsugiPolicyHash,
            knownGoodSnapshots: kintsugiKnownGoodCount,
        },
    };
}
