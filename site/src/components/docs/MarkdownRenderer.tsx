"use client";

import { MDXRemote, type MDXRemoteSerializeResult } from "next-mdx-remote";
import { Check, Copy } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode, HTMLAttributes } from "react";
import Link from "next/link";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTheme } from "next-themes";
interface MarkdownRendererProps {
  source: MDXRemoteSerializeResult;
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function extractText(node: ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (
    node &&
    typeof node === "object" &&
    "props" in node &&
    node.props &&
    typeof node.props === "object" &&
    "children" in node.props
  ) {
    return extractText(node.props.children as ReactNode);
  }
  return "";
}

function CodeBlock(props: HTMLAttributes<HTMLPreElement>) {
  const [copied, setCopied] = useState(false);

  const code = useMemo(
    () => extractText(props.children).trimEnd(),
    [props.children],
  );

  const language = useMemo(() => {
    const raw = props["data-language" as keyof typeof props];
    if (typeof raw === "string" && raw.trim()) return raw;
    const child = (props.children as any)?.props?.className ?? "";
    const match = /language-(\w+)/.exec(child);
    return match?.[1] ?? "typescript"; // fallback to typescript
  }, [props]);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  const { resolvedTheme } = useTheme(); // resolvedTheme handles 'system' preference automatically
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering after mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Use a fallback or skeleton until the theme is resolved
  if (!mounted) {
    return <div className="h-40 w-full animate-pulse rounded-xl bg-muted" />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <figure
      className={cn(
        "group my-6 overflow-hidden rounded-xl border border-border shadow-sm",
        isDark ? "bg-[#282c34]" : "bg-[#fafafa]",
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "flex items-center justify-between border-b px-4 py-2",
          isDark ? "border-white/10 bg-white/5" : "border-black/8 bg-black/3",
        )}
      >
        <span
          className={cn(
            "text-xs font-medium uppercase tracking-wide",
            isDark ? "text-white/40" : "text-black/40",
          )}
        >
          {language}
        </span>
        <button
          type="button"
          onClick={copyCode}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors",
            isDark
              ? "text-white/40 hover:bg-white/10 hover:text-white/80"
              : "text-black/40 hover:bg-black/5 hover:text-black/70",
          )}
          aria-label={copied ? "Copied code" : "Copy code"}
        >
          {copied ? (
            <>
              <Check className="size-3.5" /> Copied
            </>
          ) : (
            <>
              <Copy className="size-3.5" /> Copy
            </>
          )}
        </button>
      </div>

      <SyntaxHighlighter
        language={language}
        style={isDark ? oneDark : oneLight}
        PreTag="div"
        customStyle={{
          margin: 0,
          padding: "1rem",
          fontSize: "0.875rem",
          lineHeight: "1.5",
          background: "transparent",
        }}
        codeTagProps={{
          style: {
            display: "block",
            fontFamily:
              "var(--font-mono, ui-monospace, 'Cascadia Code', monospace)",
          },
        }}
      >
        {code}
      </SyntaxHighlighter>
    </figure>
  );
}

export function MarkdownRenderer({ source }: MarkdownRendererProps) {
  return (
    <div className="max-w-none text-foreground">
      <MDXRemote
        {...source}
        components={{
          // ── Headings ──────────────────────────────────────────────
          h1: ({ children }) => (
            <h1 className="mt-2 mb-6 scroll-mt-24 text-4xl font-bold tracking-tight text-foreground">
              {children}
            </h1>
          ),
          h2: ({ children, id }) => (
            <h2
              id={id}
              className="mt-12 mb-4 scroll-mt-24 border-b border-border pb-2 text-2xl font-semibold tracking-tight text-foreground"
            >
              {children}
            </h2>
          ),
          h3: ({ children, id }) => (
            <h3
              id={id}
              className="mt-8 mb-3 scroll-mt-24 text-xl font-semibold tracking-tight text-foreground"
            >
              {children}
            </h3>
          ),
          h4: ({ children, id }) => (
            <h4
              id={id}
              className="mt-6 mb-2 scroll-mt-24 text-lg font-semibold text-foreground"
            >
              {children}
            </h4>
          ),

          // ── Body text ─────────────────────────────────────────────
          p: ({ children }) => (
            <p className="my-4 leading-7 text-muted-foreground">{children}</p>
          ),

          // ── Links ─────────────────────────────────────────────────
          a: ({ href = "", children, ...props }) => {
            const isInternal = href.startsWith("/");
            const isHash = href.startsWith("#");

            if (isInternal) {
              return (
                <Link
                  href={href}
                  className="font-medium text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
                >
                  {children}
                </Link>
              );
            }
            return (
              <a
                href={href}
                target={isHash ? undefined : "_blank"}
                rel={isHash ? undefined : "noopener noreferrer"}
                className="font-medium text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
                {...props}
              >
                {children}
              </a>
            );
          },

          // ── Lists ─────────────────────────────────────────────────
          ul: ({ children }) => (
            <ul className="my-5 ml-6 list-disc space-y-2 text-muted-foreground marker:text-muted-foreground/50">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-5 ml-6 list-decimal space-y-2 text-muted-foreground marker:text-muted-foreground/50">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="leading-7">{children}</li>,

          // ── Inline code ───────────────────────────────────────────
          code: ({ className, children, ...props }) => {
            const isBlock = className?.startsWith("language-");
            if (isBlock)
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            return (
              <code className="rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-[0.875em] text-foreground">
                {children}
              </code>
            );
          },

          // ── Block code ────────────────────────────────────────────
          pre: CodeBlock,

          // ── Block quote ───────────────────────────────────────────
          blockquote: ({ children }) => (
            <blockquote className="my-6 rounded-r-lg border-l-4 border-primary bg-muted/40 px-5 py-3 text-muted-foreground italic">
              {children}
            </blockquote>
          ),

          // ── Horizontal rule ───────────────────────────────────────
          hr: () => <hr className="my-8 border-border" />,

          // ── Strong / Em ───────────────────────────────────────────
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-muted-foreground">{children}</em>
          ),

          // ── Table ─────────────────────────────────────────────────
          table: ({ children }) => (
            <div className="my-6 overflow-x-auto rounded-xl border border-border">
              <table className="w-full border-collapse text-sm">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-muted/50">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="px-4 py-3 text-left font-medium text-foreground">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-t border-border px-4 py-3 text-muted-foreground">
              {children}
            </td>
          ),
        }}
      />
    </div>
  );
}
