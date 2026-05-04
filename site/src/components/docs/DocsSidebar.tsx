"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DocItem } from "@/lib/docs";

interface DocsSidebarProps {
  docs: DocItem[];
  className?: string;
  onNavigate?: () => void;
}

interface SidebarLinkProps {
  doc: DocItem;
  pathname: string;
  onNavigate?: () => void;
  depth?: number;
}

function SidebarLink({
  doc,
  pathname,
  onNavigate,
  depth = 0,
}: SidebarLinkProps) {
  const isActive = pathname === `/docs/${doc.slug}`;
  const hasChildren = doc.children && doc.children.length > 0;
  const isChildActive = doc.children?.some(
    (child) => pathname === `/docs/${child.slug}`,
  );

  return (
    <div>
      <Link
        href={`/docs/${doc.slug}`}
        onClick={onNavigate}
        className={cn(
          "group relative flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-all duration-150",
          depth > 0 &&
            "ml-3 border-l border-border pl-4 rounded-none rounded-r-md",
          isActive
            ? "bg-primary/8 text-primary font-medium"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
        )}
      >
        {/* Active left accent bar */}
        {isActive && (
          <span className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full bg-primary" />
        )}

        <span className="flex-1 truncate">{doc.title}</span>

        {hasChildren && (
          <ChevronRight
            className={cn(
              "h-3.5 w-3.5 shrink-0 text-muted-foreground/50 transition-transform duration-200",
              isChildActive && "rotate-90",
            )}
          />
        )}
      </Link>

      {/* Nested children */}
      {hasChildren && (isActive || isChildActive) && (
        <div className="mt-0.5 space-y-0.5">
          {doc.children!.map((child) => (
            <SidebarLink
              key={child.slug}
              doc={child}
              pathname={pathname}
              onNavigate={onNavigate}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function DocsSidebar({ docs, className, onNavigate }: DocsSidebarProps) {
  const pathname = usePathname();

  // Group docs by their group field
  const grouped = docs.reduce(
    (acc, doc) => {
      const group = doc.group || "__ungrouped__";
      if (!acc[group]) {
        acc[group] = [];
      }
      acc[group].push(doc);
      return acc;
    },
    {} as Record<string, DocItem[]>,
  );

  return (
    <aside className={cn("w-64 shrink-0 hidden lg:flex flex-col", className)}>
      {/* Sticky scrollable inner */}
      <div
        className="sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto overflow-x-hidden py-6 pr-2
                      scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
      >
        <nav className="space-y-6 px-4">
          {Object.entries(grouped).map(([group, groupDocs]) => {
            if (group === "__ungrouped__") {
              // Ungrouped items - no header
              return (
                <div key={group} className="space-y-0.5">
                  {groupDocs.map((doc) => (
                    <SidebarLink
                      key={doc.slug}
                      doc={doc}
                      pathname={pathname}
                      onNavigate={onNavigate}
                    />
                  ))}
                </div>
              );
            }

            // Grouped items - show header
            return (
              <div key={group} className="space-y-0.5">
                <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                  {group}
                </p>
                {groupDocs.map((doc) => (
                  <SidebarLink
                    key={doc.slug}
                    doc={doc}
                    pathname={pathname}
                    onNavigate={onNavigate}
                  />
                ))}
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
