import * as crypto from "crypto";
import * as fs from "fs";

export type EvidenceType = "pasted_text" | "file_hash" | "external_ref";

export type Evidence = {
    id: string;
    type: EvidenceType;
    source: string;
    hash: string;
    collectedAt: string;
    notes?: string;
};

function sha256Hex(buf: Buffer | string): string {
    return crypto.createHash("sha256").update(buf).digest("hex");
}

export function evidenceFromPastedText(text: string, notes?: string): Evidence {
    const body = text ?? "";
    const hash = sha256Hex(body);
    const id = `ev-${hash.slice(0, 16)}`;
    return {
        id,
        type: "pasted_text",
        source: "pasted_text",
        hash,
        collectedAt: new Date().toISOString(),
        notes: typeof notes === "string" && notes.trim().length > 0 ? notes : undefined
    };
}

export function evidenceFromExternalRef(ref: string, notes?: string): Evidence {
    const normalized = String(ref ?? "").trim();
    const hash = sha256Hex(normalized);
    const id = `ev-${hash.slice(0, 16)}`;
    return {
        id,
        type: "external_ref",
        source: normalized,
        hash,
        collectedAt: new Date().toISOString(),
        notes: typeof notes === "string" && notes.trim().length > 0 ? notes : undefined
    };
}

export function sha256FileHex(filePath: string): string {
    const h = crypto.createHash("sha256");
    const fd = fs.openSync(filePath, "r");
    try {
        const buf = Buffer.alloc(1024 * 1024);
        while (true) {
            const n = fs.readSync(fd, buf, 0, buf.length, null);
            if (!n) break;
            h.update(buf.subarray(0, n));
        }
        return h.digest("hex");
    } finally {
        try {
            fs.closeSync(fd);
        } catch {
            // ignore
        }
    }
}

export function evidenceFromFileHash(filePath: string, notes?: string): Evidence {
    const normalized = String(filePath ?? "").trim();
    const hash = sha256FileHex(normalized);
    const id = `ev-${hash.slice(0, 16)}`;
    return {
        id,
        type: "file_hash",
        source: normalized,
        hash,
        collectedAt: new Date().toISOString(),
        notes: typeof notes === "string" && notes.trim().length > 0 ? notes : undefined
    };
}
