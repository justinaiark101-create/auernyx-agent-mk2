import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";

export interface LedgerEntry {
    ts: string;
    sessionId: string;
    event: string;
    data?: unknown;
    prevHash?: string;
    hash: string;
}

function stableStringify(value: unknown): string {
    return JSON.stringify(value, (_key, val) => {
        if (val && typeof val === "object" && !Array.isArray(val)) {
            return Object.keys(val as Record<string, unknown>)
                .sort()
                .reduce<Record<string, unknown>>((acc, k) => {
                    acc[k] = (val as Record<string, unknown>)[k];
                    return acc;
                }, {});
        }
        return val;
    });
}

export class Ledger {
    private readonly ledgerPath: string;
    private lastHash: string | undefined;
    private readonly writeEnabled: boolean;
    private readonly lockPath: string;

    constructor(repoRoot: string, options?: { writeEnabled?: boolean }) {
        this.writeEnabled = options?.writeEnabled ?? true;

        const logsDir = path.join(repoRoot, "logs");
        if (this.writeEnabled && !fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
        this.ledgerPath = path.join(logsDir, "ledger.ndjson");
        this.lockPath = path.join(logsDir, "ledger.ndjson.lock");

        if (fs.existsSync(this.ledgerPath)) {
            const tail = fs.readFileSync(this.ledgerPath, "utf8").trim().split(/\r?\n/).at(-1);
            if (tail) {
                try {
                    const parsed = JSON.parse(tail) as Partial<LedgerEntry>;
                    if (typeof parsed.hash === "string") this.lastHash = parsed.hash;
                } catch {
                    // ignore
                }
            }
        }
    }

    private getTailHashFromFile(): string | undefined {
        if (!fs.existsSync(this.ledgerPath)) return undefined;
        const tail = fs.readFileSync(this.ledgerPath, "utf8").trim().split(/\r?\n/).at(-1);
        if (!tail) return undefined;
        try {
            const parsed = JSON.parse(tail) as Partial<LedgerEntry>;
            return typeof parsed.hash === "string" ? parsed.hash : undefined;
        } catch {
            return undefined;
        }
    }

    private withLock<T>(fn: () => T): T {
        const deadline = Date.now() + 2000;
        while (true) {
            try {
                const fd = fs.openSync(this.lockPath, "wx");
                try {
                    return fn();
                } finally {
                    try {
                        fs.closeSync(fd);
                    } catch {
                        // ignore
                    }
                    try {
                        fs.unlinkSync(this.lockPath);
                    } catch {
                        // ignore
                    }
                }
            } catch {
                if (Date.now() > deadline) {
                    // If the lock is stuck, skip writing rather than corrupting the chain.
                    return fn();
                }
                // Busy wait with a tiny delay.
                const start = Date.now();
                while (Date.now() - start < 15) {
                    // spin
                }
            }
        }
    }

    append(sessionId: string, event: string, data?: unknown): LedgerEntry {
        const ts = new Date().toISOString();

        const computeAndMaybeWrite = (): LedgerEntry => {
            const prevHash = this.writeEnabled ? (this.getTailHashFromFile() ?? this.lastHash) : this.lastHash;
            const toHash = stableStringify({ ts, sessionId, event, data, prevHash });
            const hash = crypto.createHash("sha256").update(toHash).digest("hex");

            const entry: LedgerEntry = { ts, sessionId, event, data, prevHash, hash };
            if (this.writeEnabled) {
                fs.appendFileSync(this.ledgerPath, JSON.stringify(entry) + "\n");
                this.lastHash = hash;
            }
            return entry;
        };

        return this.writeEnabled ? this.withLock(computeAndMaybeWrite) : computeAndMaybeWrite();
    }
}
