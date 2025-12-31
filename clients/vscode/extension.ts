import * as vscode from "vscode";
import { createCore } from "../../core/server";
import { tryRunViaDaemon } from "../../core/daemonClient";
import { createHumanApproval } from "../../core/approvals";
import { capabilityRequiresApproval, CapabilityName } from "../../core/policy";
import { runLifecycle } from "../../core/runLifecycle";

async function getApprovalFromUser(capability: string): Promise<ReturnType<typeof createHumanApproval> | null> {
    const pick = await vscode.window.showWarningMessage(
        `Approval required: ${capability}`,
        { modal: true, detail: "Auernyx will not execute changes without explicit human approval." },
        "Approve",
        "Cancel"
    );

    if (pick !== "Approve") return null;

    const reason = await vscode.window.showInputBox({
        prompt: `Reason for approving ${capability}`,
        placeHolder: "Why are you allowing this change?",
        validateInput: (v) => (v.trim().length > 0 ? null : "Reason is required")
    });

    if (!reason) return null;
    return createHumanApproval(reason.trim());
}

export function activate(context: vscode.ExtensionContext) {
    const workspace = vscode.workspace.workspaceFolders?.[0];
    const repoRoot = workspace?.uri.fsPath;

    if (!repoRoot) {
        vscode.window.showWarningMessage("Auernyx: No workspace open.");
        return;
    }

    const core = createCore(repoRoot);

    context.subscriptions.push(
        vscode.commands.registerCommand("auernyx.ask", async () => {
            const input = await vscode.window.showInputBox({ prompt: "Speak to Auernyx" });
            if (!input) return;

            try {
                // Try daemon first.
                let daemon = await tryRunViaDaemon({ repoRoot }, input);
                if (daemon !== null) {
                    if (!daemon.ok && daemon.error === "approval_required") {
                        const approval = await getApprovalFromUser(daemon.capability ?? "capability");
                        if (!approval) return;
                        daemon = await tryRunViaDaemon({ repoRoot }, input, undefined, approval);
                    }
                    if (daemon === null) {
                        // daemon disappeared mid-flight; fall back to local
                    } else {
                    if (!daemon.ok) throw new Error(daemon.error ?? "daemon error");
                    core.ledger.append(core.sessionId, "intent.routed", { input, capability: daemon.capability, result: daemon.result, via: "daemon" });
                    vscode.window.showInformationMessage(`Auernyx: Ran ${daemon.capability ?? "capability"}.`);
                    return;
                    }
                }

                const capability = core.router.route({ raw: input });
                if (!capability) {
                    vscode.window.showInformationMessage(`Auernyx: Unroutable intent: "${input}"`);
                    return;
                }

                const needsApproval = capabilityRequiresApproval(capability as CapabilityName);
                const approval = needsApproval ? await getApprovalFromUser(capability) : null;
                if (needsApproval && !approval) return;

                const lifecycle = await runLifecycle({
                    router: core.router,
                    ctx: { repoRoot, sessionId: core.sessionId },
                    intent: input,
                    approval: approval ?? undefined,
                });
                if (!lifecycle.ok) throw new Error(lifecycle.refusal?.code ?? lifecycle.refusal?.reason ?? "refused");
                core.ledger.append(core.sessionId, "intent.routed", { input, capability: lifecycle.capability, result: lifecycle.result, via: "local" });
                vscode.window.showInformationMessage(`Auernyx: Ran ${capability}.`);
            } catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                core.ledger.append(core.sessionId, "intent.error", { input, error: msg });
                vscode.window.showErrorMessage(`Auernyx: ${msg}`);
            }
        }),

        vscode.commands.registerCommand("auernyx.scanRepo", async () => {
            try {
                let daemon = await tryRunViaDaemon({ repoRoot }, "scan");
                if (daemon !== null) {
                    if (!daemon.ok && daemon.error === "approval_required") {
                        const approval = await getApprovalFromUser(daemon.capability ?? "scanRepo");
                        if (!approval) return;
                        daemon = await tryRunViaDaemon({ repoRoot }, "scan", undefined, approval);
                    }

                    if (daemon !== null) {
                        if (!daemon.ok) throw new Error(daemon.error ?? "daemon error");
                        const outputs = (daemon.result as any)?.outputs;
                        const first = Array.isArray(outputs) ? outputs[0] : undefined;
                        const fileCount = Number(first?.output?.fileCount ?? 0);
                        core.ledger.append(core.sessionId, "capability.scanRepo", { ...daemon, via: "daemon" });
                        vscode.window.showInformationMessage(`Auernyx: Repo scan complete. ${fileCount} files indexed.`);
                        return;
                    }
                }

                const approval = await getApprovalFromUser("scanRepo");
                if (!approval) return;

                const lifecycle = await runLifecycle({
                    router: core.router,
                    ctx: { repoRoot, sessionId: core.sessionId },
                    intent: "scan",
                    approval,
                });
                if (!lifecycle.ok) throw new Error(lifecycle.refusal?.code ?? lifecycle.refusal?.reason ?? "refused");
                core.ledger.append(core.sessionId, "capability.scanRepo", { result: lifecycle.result, via: "local" });
                const first = Array.isArray(lifecycle.result) ? lifecycle.result[0] : lifecycle.result;
                const fileCount = (first as { output?: { fileCount?: number } } | undefined)?.output?.fileCount ?? 0;
                vscode.window.showInformationMessage(`Auernyx: Repo scan complete. ${fileCount} files indexed.`);
            } catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                vscode.window.showErrorMessage(`Auernyx: ${msg}`);
            }
        }),

        vscode.commands.registerCommand("auernyx.fenerisPrep", async () => {
            try {
                let daemon = await tryRunViaDaemon({ repoRoot }, "feneris");
                if (daemon !== null) {
                    if (!daemon.ok && daemon.error === "approval_required") {
                        const approval = await getApprovalFromUser(daemon.capability ?? "fenerisPrep");
                        if (!approval) return;
                        daemon = await tryRunViaDaemon({ repoRoot }, "feneris", undefined, approval);
                    }
                    if (daemon !== null) {
                        if (!daemon.ok) throw new Error(daemon.error ?? "daemon error");
                        core.ledger.append(core.sessionId, "capability.fenerisPrep", { ...daemon, via: "daemon" });
                        vscode.window.showInformationMessage("Auernyx: Windows Feneris prep scaffold created.");
                        return;
                    }
                }

                const approval = await getApprovalFromUser("fenerisPrep");
                if (!approval) return;

                const lifecycle = await runLifecycle({
                    router: core.router,
                    ctx: { repoRoot, sessionId: core.sessionId },
                    intent: "feneris",
                    approval,
                });
                if (!lifecycle.ok) throw new Error(lifecycle.refusal?.code ?? lifecycle.refusal?.reason ?? "refused");
                core.ledger.append(core.sessionId, "capability.fenerisPrep", { result: lifecycle.result, via: "local" });
                vscode.window.showInformationMessage("Auernyx: Windows Feneris prep scaffold created.");
            } catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                vscode.window.showErrorMessage(`Auernyx: ${msg}`);
            }
        })
    );

    console.log("Auernyx Agent loaded.");
}

export function deactivate() {}
