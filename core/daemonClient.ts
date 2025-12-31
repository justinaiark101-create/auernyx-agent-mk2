import * as http from "http";
import { loadConfig } from "./config";

export interface DaemonRunResponse {
    ok: boolean;
    capability?: string;
    result?: unknown;
    error?: string;
}

export interface DaemonClientOptions {
    repoRoot: string;
    timeoutMs?: number;
}

function requestJson(
    opts: http.RequestOptions,
    body?: unknown,
    timeoutMs: number = 1500
): Promise<{ status: number; json: unknown }> {
    return new Promise((resolve, reject) => {
        const payload = body ? Buffer.from(JSON.stringify(body), "utf8") : undefined;

        const req = http.request(
            {
                ...opts,
                headers: {
                    "content-type": "application/json; charset=utf-8",
                    ...(payload ? { "content-length": payload.byteLength } : {}),
                    ...(opts.headers ?? {})
                }
            },
            (res) => {
                const chunks: Buffer[] = [];
                res.on("data", (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
                res.on("end", () => {
                    const raw = Buffer.concat(chunks).toString("utf8").trim();
                    try {
                        resolve({ status: res.statusCode ?? 0, json: raw ? JSON.parse(raw) : {} });
                    } catch (e) {
                        reject(e);
                    }
                });
            }
        );

        req.setTimeout(timeoutMs, () => {
            req.destroy(new Error("timeout"));
        });

        req.on("error", reject);
        if (payload) req.write(payload);
        req.end();
    });
}

export function getDaemonAddress(repoRoot: string): { host: string; port: number } {
    const cfg = loadConfig(repoRoot);
    const host = process.env.AUERNYX_HOST ?? cfg.daemon.host;
    const port = process.env.AUERNYX_PORT ? Number(process.env.AUERNYX_PORT) : cfg.daemon.port;

    return {
        host,
        port: Number.isFinite(port) && port > 0 ? port : cfg.daemon.port
    };
}

function getDaemonSecret(repoRoot: string): string {
    const cfg = loadConfig(repoRoot);
    const secret = process.env.AUERNYX_SECRET ?? (cfg.daemon.secret ?? "");
    return typeof secret === "string" ? secret : "";
}

export async function tryRunViaDaemon(
    opts: DaemonClientOptions,
    intent: string,
    input?: unknown,
    approval?: unknown
): Promise<DaemonRunResponse | null> {
    const { host, port } = getDaemonAddress(opts.repoRoot);
    const secret = getDaemonSecret(opts.repoRoot);
    const headers = secret.trim().length > 0 ? { "x-auernyx-secret": secret } : undefined;

    const post = async (path: string, body: unknown) =>
        requestJson(
            {
                host,
                port,
                method: "POST",
                path,
                headers
            },
            body,
            opts.timeoutMs ?? 1500
        );

    try {
        // Meta intents still go through /run.
        const normalized = (intent ?? "").trim().toLowerCase();
        const isMeta =
            normalized === "ping" ||
            normalized === "health" ||
            normalized === "help" ||
            normalized === "capabilities" ||
            normalized === "list" ||
            normalized === "status";

        if (isMeta) {
            const { status, json } = await post("/run", { intent, input, approval });

            if (typeof json !== "object" || json === null) return null;
            const resp = json as Partial<DaemonRunResponse>;

            if (status >= 400) {
                return {
                    ok: false,
                    capability: typeof resp.capability === "string" ? resp.capability : undefined,
                    error: typeof resp.error === "string" ? resp.error : `HTTP ${status}`
                };
            }

            return {
                ok: Boolean(resp.ok),
                capability: typeof resp.capability === "string" ? resp.capability : undefined,
                result: resp.result,
                error: typeof resp.error === "string" ? resp.error : undefined
            };
        }

        // Governed orchestrator loop: /plan -> /step.
        const planResp = await post("/plan", { intent, input });
        const planJson = planResp.json as any;
        if (typeof planJson !== "object" || planJson === null) return null;

        const plan = planJson?.result?.plan;
        const capability = typeof planJson?.capability === "string" ? planJson.capability : undefined;

        const firstStepId = typeof plan?.steps?.[0]?.id === "string" ? plan.steps[0].id : "step-1";

        if (!approval) {
            return {
                ok: false,
                capability,
                error: "step_approval_required"
            };
        }

        const stepResp = await post("/step", { intent, input, stepId: firstStepId, approval });
        const stepJson = stepResp.json as any;

        if (stepResp.status >= 400) {
            return {
                ok: false,
                capability: typeof stepJson?.capability === "string" ? stepJson.capability : capability,
                error: typeof stepJson?.error === "string" ? stepJson.error : `HTTP ${stepResp.status}`
            };
        }

        return {
            ok: Boolean(stepJson?.ok),
            capability: typeof stepJson?.capability === "string" ? stepJson.capability : capability,
            result: stepJson?.result,
            error: typeof stepJson?.error === "string" ? stepJson.error : undefined
        };
    } catch {
        // Connection refused / timeout / no daemon.
        return null;
    }
}

export async function isDaemonHealthy(opts: DaemonClientOptions): Promise<boolean> {
    const { host, port } = getDaemonAddress(opts.repoRoot);

    try {
        const { status, json } = await requestJson(
            {
                host,
                port,
                method: "GET",
                path: "/health"
            },
            undefined,
            opts.timeoutMs ?? 750
        );

        if (status !== 200) return false;
        if (typeof json !== "object" || json === null) return false;
        return (json as { ok?: unknown }).ok === true;
    } catch {
        return false;
    }
}
