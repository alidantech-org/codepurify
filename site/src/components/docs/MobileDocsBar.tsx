"use client";

import { useState } from "react";
import { Menu, ChevronLeft, ChevronRight, X } from "lucide-react";
import { DocsSidebar } from "@/components/docs/DocsSidebar";

type DocItem = {
  slug: string;
  title: string;
  description?: string;
};

export function MobileDocsBar({ docs }: { docs: DocItem[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="sticky top-14 z-40 border-b border-border bg-background/90 backdrop-blur-xl lg:hidden">
      <div className="flex h-12 items-center justify-between px-4">
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-2 py-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Menu className="h-4 w-4" />
          Docs
        </button>

        <div className="flex items-center gap-1">
          <button className="p-1 text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button className="p-1 text-muted-foreground hover:text-foreground transition-colors">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />
          <div className="fixed left-0 top-0 h-full w-80 bg-background shadow-lg">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold">Documentation</h2>
              <button
                onClick={() => setOpen(false)}
                className="p-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="h-full overflow-y-auto px-4 py-6">
              <DocsSidebar docs={docs} onNavigate={() => setOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
