interface PipelineStep {
  step: string;
  description: string;
}

interface PipelineProps {
  steps: PipelineStep[];
}

export function Pipeline({ steps }: PipelineProps) {
  return (
    <section id="pipeline" className="pb-24">
      <p className="mb-3 font-mono text-[11px] uppercase tracking-widest text-secondary">
        Pipeline
      </p>
      <h2 className="mb-3 text-3xl font-semibold tracking-tight text-foreground">
        Compiler Pipeline
      </h2>
      <p className="mb-12 max-w-xl text-[15px] leading-7 text-muted">
        A deterministic, multi-stage pipeline transforms typed configs into any
        architecture artifact — no magic, no coupling.
      </p>

      <div className="overflow-hidden rounded-2xl border-border bg-card/50">
        {steps.map(({ step, description }, i) => (
          <div
            key={step}
            className={`flex items-center gap-5 px-6 py-4 ${
              i !== steps.length - 1 ? "border-b border-border" : ""
            } group transition-colors hover:bg-card-muted/50`}
          >
            <span className="w-8 shrink-0 font-mono text-xs text-muted-foreground group-hover:text-primary">
              {step}
            </span>
            <div className="h-px flex-1 border-t border-dashed border-border" />
            <span className="text-sm font-medium text-foreground group-hover:text-foreground">
              {description}
            </span>
            <svg
              className="h-4 w-4 text-muted-foreground group-hover:text-secondary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        ))}
      </div>
    </section>
  );
}
