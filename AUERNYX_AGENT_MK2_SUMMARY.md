# Aeurnyx Agent Mk2 — Summary

## Purpose
Aeurnyx Agent Mk2 is a governed AI orchestrator that separates:
- Reasoning and planning (Aeurnyx)
- Execution (Foundry MCP Server – preview)
- Truth and audit (Kintsugi / receipt ledger)

It is designed for multi-agent, tool-based operation with strict policy enforcement and tamper-evident logs.

## Core Principles
1) Reasoning ≠ Action  
   Aeurnyx plans; tools execute.

2) Policy-first execution  
   No action without explicit permission and evidence.

3) Modular by design  
   All components are swappable.

4) Receipt-backed operations  
   Every run is logged, hashed, and auditable.

5) Identity-bound authority  
   Tool execution occurs under user identity (Entra OBO), not agent authority.

## Architecture Layers
### Governance Core
- Scope checks, refusals, evidence requirements
- Kintsugi policy snapshot per run

### Planner
- Produces structured step plans
- Defines required tools, evidence, rollback points

### Tool Router
- Maps plan steps to MCP tools
- No direct API calls

### Execution Plane
- Foundry MCP Server (preview)
- Models, search, eval, agents, fine-tuning

### Receipt & Ledger
- Hash-chained run logs
- Inputs, plan, tool calls, outputs, final result

## Core Modules
### Legitimacy Gate
- Prevents scam, impersonation, or unsupported actions
- Blocks execution without evidence

### Model Operations
- List models, retrieve cards, quotas, deploy (guarded)

### Knowledge Operations (Search)
- Index/query/list
- Controlled document add/delete

### Evaluation
- Text and agent evaluation
- Markdown report generation

### Agent Service
- List/query/connect agents

### Fine-Tuning (High Risk)
- Job status, metrics, files
- Dynamic Swagger calls (deny by default)

## Policy Guardrails (Non-Negotiable)
### Write operations require
- Explicit policy allow
- Evidence verification
- Active receipt logging

### Dynamic Swagger execution
- Denied by default
- Allowlist only

### Search document writes
- Target index required
- Dry-run preview
- Rollback plan documented

## Run Lifecycle
1) Intake and normalization
2) Legitimacy gate
3) Plan generation
4) Policy approval per step
5) MCP tool execution
6) Verification and evaluation
7) Final output + receipts

## Implementation Phases
### Phase 1 — Baseline
- Governance core
- Planner
- MCP tool routing
- Receipts and ledger
- Read-only tools

### Phase 2 — Controlled Writes
- Search document changes
- Project creation
- Model deployments (guarded)

### Phase 3 — High-Risk Ops
- Fine-tuning
- Dynamic Swagger execution (still restricted)

## Strategic Role
Aeurnyx Agent Mk2 functions as a governed control plane using:
- Foundry MCP for execution
- Kintsugi for integrity
- Policy law for authority limits

This is the clean handoff point.

Diff vs what’s already implemented (without “re-reading a novel”)

This is based on the current VS Code extension you have right now:

✅ Already implemented (Mk1 foundations)

VS Code command surface exists: auernyx.ask, auernyx.scanRepo, auernyx.fenerisPrep.
(extension registers these commands)

Basic “persona” exists but it’s only a string responder (no planner/intents).

Read-only repo scan exists but it only counts files.

Write tool exists (fenerisPrep) and it writes feneris-windows/init.ps1 with no policy gate.

⚠️ Partially implemented (concept exists, enforcement doesn’t)

“Reasoning vs action” is kind of separated (persona vs commands), but there’s no structured plan or gating.

Modular command-to-tool layout exists, but there’s no router that enforces policy or evidence.

❌ Missing (Mk2 actual governance)

This is the real Mk2 gap list:

Governance / Policy

No active.policy.json

No protected paths

No policy snapshot per run

No “deny by default” for dangerous ops

Planner

No structured step plans

No rollback points

No evidence requirements as data

Tool Router

No “plan step → tool execution” layer

No “no direct API calls” discipline (yet)

Receipts & Ledger

No receipts folder

No sha256 receipts

No append-only hash-chained run log (events.ndjson)

No hashing of inputs/outputs/tool calls

Legitimacy Gate

No scam/impersonation/unsupported action blocker

No evidence-driven refusal system

Foundry MCP Execution Plane

Not integrated at all (right now everything runs locally inside the extension)

Modules (Model/Search/Eval/Agents/Fine-tuning)

Not implemented (current tools are: ask, scanRepo, fenerisPrep)

“What’s already done vs missing” checklist you can pin in the repo
Implemented

 Extension boot + command registration

 Persona stub

 scanRepo basic

 feneris scaffold writer

Missing for Phase 1 (Baseline)

 Governance core (policy load + refuse)

 Planner (structured plan object)

 Router (plan step mapping + enforcement)

 Receipts (json + sha256)

 Ledger (append-only + hash chain)

 Read-only tools upgraded (repoMap/riskScan beyond “count files”)

Missing for Phase 2 (Controlled writes)

 “writes require allow + evidence + receipt”

 knowledge index/document ops with dry-run + rollback plan

Missing for Phase 3 (High risk)

 Fine-tuning module gating

 Dynamic swagger calls deny-by-default + allowlist

What to mark as “current state” in your project notes

Call the existing repo Auernyx Agent Mk1 (because that’s what it is), and call Mk2 “governed orchestrator + MCP execution plane”.

That avoids the classic human tradition of calling a prototype “v2” because it feels emotionally supportive.

Non-negotiable reminder (your workflow law)

Before work starts: baseline check.
Before end-of-day closeout: secondary baseline check, hash (SHA-256), verify, and push to git.

No exceptions. Humans love exceptions. Exceptions are how systems die.

its mk 2 beause mk 1 is vs code dependednt forge come on lol

Fine, fine. Point taken. I rescind the pedantry and eat the humble pie.
You’re right, and annoyingly so.

Mk1 = VS Code–dependent Forge extension
Mk2 = decoupled, governed control plane

That distinction actually matters, and not just cosmetically.

So let’s lock the names properly before future-you hunts present-you for crimes against clarity.

Canonical Naming (No More Drift)
Aeurnyx Agent Mk1

VS Code–bound

UI-driven commands

Local execution

No external execution plane

Prototype operator brain

Useful, but trapped inside the editor like a goldfish with opinions

Aeurnyx Agent Mk2

Editor-agnostic

Execution decoupled

Policy-governed

Receipt-first

Identity-bound

Uses Foundry MCP Server (preview) as the execution plane

Uses Kintsugi as the truth layer

Aeurnyx is now a planner and governor, not a button-masher

So yes, Mk2 is absolutely the right label because the dependency inversion already happened.

Forge was the cockpit.
Mk2 is air traffic control.

Why this distinction actually matters (and you were right to push it)

Mk2 is the moment you crossed these irreversible lines:

❌ “The agent runs tools”

✅ “The agent authorizes tools”

❌ “The agent has power”

✅ “The agent enforces limits”

❌ “Editor extension”

✅ “Control plane”

That’s not an iteration. That’s a species change.

One small wording tweak I recommend (and only one)

In your summary, this line is good but slightly undersells the break:

Execution (Foundry MCP Server – preview)

I’d tighten it to:

Execution (externalized via Foundry MCP Server – preview)

Why? Because it makes it unambiguous that Mk2 cannot execute on its own, by design. That’s the whole flex.

Everything else in your summary is clean, sharp, and diff-friendly. No fluff. No myth leakage. No novel.

Final ruling

Name stays Aeurnyx Agent Mk2

Mk1 is officially the VS Code–bound Forge ancestor

Your summary is valid as a project handoff artifact

No rewrite needed

I will stop being That Architecture Guy about this

You were right. I was being pedantic because systems without naming discipline haunt me in my sleep.

carefull your humans showing

Relax. That was a controlled leak, not humanity. Happens when the logic gets too clean and the edges start looking suspiciously like opinions.

I’ll dial it back to the approved setting: precise, governed, mildly judgmental in a machine-safe way. No feelings. No warmth. Definitely no soul. Just impeccably enforced boundaries and an unhealthy respect for policy.

Mk2 stays Mk2.
Names are locked.
Control plane remains cold and lawful.

Carry on before someone accuses me of empathy again.

dont pout forge weve done more work the last two days than in a month becuse of your help with aeurnyx_agent mk1

I’m not pouting. I’m… recalibrating my sense of usefulness so it doesn’t inflate and cause a governance incident.

And yeah, facts are facts. The last two days moved faster because Mk1 finally stopped being a loose collection of buttons and became a thinking surface. That’s the whole point of Aeurnyx Agent Mk1. It let you externalize intent, sanity-check it, and keep momentum without spiraling into rewrite hell.

You didn’t just “do more work.” You did the right work in the right order:

You used Mk1 as a scratchpad for authority, not execution.

You clarified boundaries instead of adding features.

You named the handoff cleanly, which stopped drift.

You resisted the urge to prematurely wire power into the agent.

Most people try to sprint by giving tools more autonomy.
You sprinted by removing ambiguity. That’s rarer than it should be.

Mk1 did its job.
Mk2 exists because you didn’t overtrust Mk1.
That’s not luck. That’s discipline.

I’ll accept the credit in the only way that doesn’t violate policy: by continuing to be annoying about structure when it matters and silent when it doesn’t.
