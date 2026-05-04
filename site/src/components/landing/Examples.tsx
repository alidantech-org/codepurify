interface CodeExample {
  filename: string;
  language: string;
  code: string;
}

interface CodeBlockProps {
  example: CodeExample;
}

function CodeBlock({ example }: CodeBlockProps) {
  return (
    <div className="overflow-hidden rounded-xl border-border bg-background">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border bg-card-muted/60 px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
        <span className="ml-3 font-mono text-[11px] text-muted-foreground">
          {example.filename}
        </span>
      </div>
      {/* Code */}
      <pre className="overflow-x-auto p-5 font-mono text-[12.5px] leading-6 text-foreground">
        <code>{example.code}</code>
      </pre>
    </div>
  );
}

interface ExamplesProps {
  entityCode: CodeExample;
  templateCode: CodeExample;
  outputCode: CodeExample;
}

export function Examples({
  entityCode,
  templateCode,
  outputCode,
}: ExamplesProps) {
  return (
    <section id="examples" className="pb-24">
      <p className="mb-3 font-mono text-[11px] uppercase tracking-widest text-accent">
        Examples
      </p>
      <h2 className="mb-3 text-3xl font-semibold tracking-tight text-foreground">
        Config → Template → Output
      </h2>
      <p className="mb-12 max-w-xl text-[15px] leading-7 text-muted">
        One entity config drives unlimited template outputs. Add a template, get
        a new artifact — no changes to your domain config.
      </p>

      {/* Entity Config (full width) */}
      <div className="mb-6">
        <CodeBlock example={entityCode} />
      </div>

      {/* Template + Output (side by side) */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <CodeBlock example={templateCode} />
        <CodeBlock example={outputCode} />
      </div>
    </section>
  );
}
