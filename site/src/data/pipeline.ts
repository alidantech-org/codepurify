import type { PipelineStep } from "./types";

export const PIPELINE_STEPS: PipelineStep[] = [
  { step: "01", description: "TypeScript Configs" },
  { step: "02", description: "Runtime Metadata Extraction" },
  { step: "03", description: "Semantic Inference Engine" },
  { step: "04", description: "Normalized Manifest" },
  { step: "05", description: "Handlebars Template Compilation" },
  { step: "06", description: "Generated Source Code" },
];
