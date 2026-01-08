// Execution Plane for Mk2
// Stubs for external execution boundaries

import { Step } from "./planner";

export type ExecutionResult =
  | { type: "external"; message: string }
  | { type: "read-only"; message: string }
  | { type: "denied"; message: string };

export function executeStep(step: Step): ExecutionResult {
  // Minimal stub: mark all as local for now
  if (step.action === "read") {
    return { type: "read-only", message: `Step ${step.id} is read-only.` };
  }
  if (step.action === "forbidden") {
    return { type: "denied", message: `Step ${step.id} is denied locally.` };
  }
  return { type: "external", message: `Step ${step.id} would be executed externally.` };
}