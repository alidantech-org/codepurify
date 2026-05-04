"use client";

import { MDXRemote, type MDXRemoteSerializeResult } from "next-mdx-remote";
import Link from "next/link";
import React from "react";
import { CodeBlock } from "./CodeBlock";
import { extractText } from "@/lib/extract-text";

type MarkdownRendererProps = {
  source: MDXRemoteSerializeResult;
};

export function MarkdownRenderer({ source }: MarkdownRendererProps) {
  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none">
      <MDXRemote
        {...source}
        components={{
          h1: (props) => (
            <h1
              className="mb-6 scroll-mt-24 text-4xl font-bold tracking-tight text-foreground"
              {...props}
            />
          ),
          h2: (props) => (
            <h2
              className="mb-4 mt-12 scroll-mt-24 border-b border-border pb-3 text-2xl font-semibold tracking-tight text-foreground"
              {...props}
            />
          ),
          h3: (props) => (
            <h3
              className="mb-3 mt-8 scroll-mt-24 text-xl font-semibold tracking-tight text-foreground"
              {...props}
            />
          ),
          p: (props) => (
            <p className="my-4 leading-7 text-muted-foreground" {...props} />
          ),
          a: ({ href = "", ...props }) => {
            const isInternal = href.startsWith("/");
            return isInternal ? (
              <Link
                href={href}
                className="font-medium text-primary underline-offset-4 hover:underline"
                {...props}
              />
            ) : (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary underline-offset-4 hover:underline"
                {...props}
              />
            );
          },
          ul: (props) => (
            <ul
              className="my-5 list-disc space-y-2 pl-6 text-muted-foreground"
              {...props}
            />
          ),
          ol: (props) => (
            <ol
              className="my-5 list-decimal space-y-2 pl-6 text-muted-foreground"
              {...props}
            />
          ),
          li: (props) => <li className="pl-1" {...props} />,
          strong: (props) => (
            <strong className="font-semibold text-foreground" {...props} />
          ),
          blockquote: (props) => (
            <blockquote
              className="my-6 rounded-r-2xl border-l-4 border-primary bg-card px-5 py-3 text-muted-foreground"
              {...props}
            />
          ),
          // Inline code only - block code handled by pre
          code: ({ className, children, ...props }) => {
            const isBlock = className?.startsWith("language-");
            if (isBlock) return null; // pre handler owns block code
            return (
              <code
                className="rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-[0.875em] text-foreground"
                {...props}
              >
                {children}
              </code>
            );
          },
          // Block code handler - this is where fenced code lives
          pre: ({ children }) => {
            // Extract the <code> child using React.Children.toArray + .find
            const codeElement = React.Children.toArray(children).find(
              (child): child is React.ReactElement =>
                React.isValidElement(child) && child.type === "code",
            );

            if (!codeElement) return <pre>{children}</pre>;

            const { className, children: codeChildren } = codeElement.props as {
              className?: string;
              children?: React.ReactNode;
            };

            // Extract language via .replace("language-", "")
            const language = className?.replace("language-", "") ?? "plaintext";

            // Extract raw text using extractText helper
            const code = extractText(codeChildren).trimEnd();

            return (
              <CodeBlock code={code} language={language} className="my-6" />
            );
          },
          table: (props) => (
            <div className="my-6 overflow-x-auto rounded-2xl border border-border">
              <table className="w-full border-collapse text-sm" {...props} />
            </div>
          ),
          th: (props) => (
            <th
              className="border-b border-border bg-muted px-4 py-3 text-left font-medium text-foreground"
              {...props}
            />
          ),
          td: (props) => (
            <td
              className="border-t border-border px-4 py-3 text-muted-foreground"
              {...props}
            />
          ),
        }}
      />
    </div>
  );
}
