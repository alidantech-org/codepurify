// src/app/docs/layout.tsx

import type { ReactNode } from "react";
import { DocsSidebar } from "@/components/docs/DocsSidebar";
import { MobileDocsBar } from "@/components/docs/MobileDocsBar";
import type { Metadata } from "next";
import { getAllDocs } from "@/lib/docs";

export const metadata: Metadata = {
  title: "Documentation - CodePurify",
  description:
    "Complete documentation for CodePurify semantic metadata inference engine",
};

export default async function DocsLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const docs = await getAllDocs();

  return (
    <>
      <MobileDocsBar docs={docs} />

      <div className="flex w-full gap-6">
        {/* Sidebar (independent scroll) */}
        <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-[260px] overflow-x-hidden overflow-y-auto border-r border-border lg:block scrollbar-thin">
          <DocsSidebar docs={docs} />
        </aside>

        {/* Main content (uses page scroll) */}
        <main className="min-w-0 flex-1 py-8">
          <div className="mx-auto max-w-5xl">{children}</div>
        </main>

        {/* Right TOC (independent scroll) */}
        <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-[240px] shrink-0 overflow-x-hidden overflow-y-auto border-l border-border pl-4 xl:block scrollbar-thin">
          <div id="toc-placeholder" />
        </aside>
      </div>
    </>
  );
}
