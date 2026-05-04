"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type DocItem = {
  slug: string;
  title: string;
  description?: string;
};

interface DocsSidebarProps {
  docs: DocItem[];
  className?: string;
  onNavigate?: () => void;
}

export function DocsSidebar({ docs, className, onNavigate }: DocsSidebarProps) {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "w-64 overflow-x-hidden shrink-0 hidden lg:block",
        className,
      )}
    >
      <div className="h-full overflow-y-auto overflow-x-hidden">
        <div className="p-6">
          <nav className="space-y-1">
            {docs.map((doc) => (
              <Link
                key={doc.slug}
                href={`/docs/${doc.slug}`}
                onClick={onNavigate}
                className={cn(
                  "block rounded-lg px-3 py-2 text-sm transition-colors",
                  pathname === `/docs/${doc.slug}`
                    ? "bg-card-muted text-foreground font-medium"
                    : "text-muted-foreground hover:bg-card-muted hover:text-foreground",
                )}
              >
                {doc.title}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
