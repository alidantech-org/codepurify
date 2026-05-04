import Link from "next/link";

export function NavBar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-linear-to-br from-primary to-secondary font-mono text-[11px] font-medium text-white">
            cp
          </span>
          <span className="text-[15px] font-medium tracking-tight text-foreground">
            codepurify
          </span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-1 text-sm text-muted">
          <Link
            href="#features"
            className="rounded-md px-3 py-1.5 transition-colors hover:bg-card-muted hover:text-foreground"
          >
            Features
          </Link>
          <Link
            href="#pipeline"
            className="rounded-md px-3 py-1.5 transition-colors hover:bg-card-muted hover:text-foreground"
          >
            Pipeline
          </Link>
          <Link
            href="#examples"
            className="rounded-md px-3 py-1.5 transition-colors hover:bg-card-muted hover:text-foreground"
          >
            Examples
          </Link>
          <a
            href="https://github.com/alidantech-org/codepurify"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 rounded-md border-border bg-card px-3 py-1.5 text-foreground transition-colors hover:border-border hover:text-foreground"
          >
            GitHub
          </a>
        </div>
      </div>
    </nav>
  );
}
