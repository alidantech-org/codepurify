"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  className?: string;
}

export function CodeBlock({
  code,
  language,
  filename,
  className,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  // Language fallback: undefined/empty/plaintext -> typescript
  const resolvedLanguage =
    !language || language === "plaintext" ? "typescript" : language;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  return (
    <div
      className={cn(
        "relative group rounded-lg border border-border bg-[#0d1117] overflow-hidden",
        className,
      )}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/20">
        <div className="flex items-center gap-3">
          {/* Language Badge */}
          <span className="text-xs font-medium text-[#8b949e] uppercase tracking-wide">
            {resolvedLanguage}
          </span>

          {/* Filename */}
          {filename && (
            <span className="text-xs text-[#c9d1d9] font-mono">{filename}</span>
          )}
        </div>

        {/* Copy Button */}
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-[#8b949e] transition-colors hover:text-[#c9d1d9] hover:bg-[#21262d] rounded-md"
          aria-label={copied ? "Copied to clipboard" : "Copy code to clipboard"}
        >
          {copied ? (
            <>
              <Check className="h-3 w-3" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              Copy
            </>
          )}
        </button>
      </div>

      {/* Syntax Highlighted Code */}
      <div className="overflow-x-auto">
        <SyntaxHighlighter
          language={resolvedLanguage}
          style={oneDark}
          customStyle={{
            margin: 0,
            padding: "1rem",
            background: "transparent",
            fontSize: "0.875rem",
            lineHeight: "1.7",
          }}
          codeTagProps={{
            style: {
              fontFamily:
                "ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace",
            },
          }}
          showLineNumbers={true}
          wrapLines={true}
          PreTag="div"
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
