"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Heading } from "@/lib/docs";

interface DocsTocProps {
  headings: Heading[];
  className?: string;
}

export function DocsToc({ headings, className }: DocsTocProps) {
  const pathname = usePathname();

  if (headings.length === 0) {
    return null;
  }

  return (
    <div className={cn("h-full xl:block px-6", className)}>
      <div className="sticky top-20 space-y-8 pl-4">
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-4">
            On this page
          </h4>
          <nav className="space-y-2">
            {headings
              .filter((heading) => heading.level <= 3)
              .map((heading) => (
                <Link
                  key={heading.id}
                  href={`#${heading.id}`}
                  className={cn(
                    "block text-sm transition-colors hover:text-foreground",
                    heading.level === 2
                      ? "text-foreground font-medium"
                      : "text-muted-foreground pl-4",
                    "py-1",
                  )}
                >
                  {heading.text}
                </Link>
              ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
