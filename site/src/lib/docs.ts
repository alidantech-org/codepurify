import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import GithubSlugger from "github-slugger";

export interface DocFrontmatter {
  title?: string;
  description?: string;
  order?: number;
  published?: boolean;
  lastModified?: string;
  group?: string;
  children?: Array<{
    slug: string;
    title: string;
  }>;
  [key: string]: unknown;
}

export interface Heading {
  id: string;
  text: string;
  level: number;
}

export interface Doc {
  slug: string;
  title: string;
  description?: string;
  content: string;
  frontmatter: DocFrontmatter;
  headings: Heading[];
  prev?: Pick<Doc, "slug" | "title" | "description">;
  next?: Pick<Doc, "slug" | "title" | "description">;
}

export interface DocItem {
  slug: string;
  title: string;
  description?: string;
  group?: string;
  children?: DocItem[];
}

export interface DocNavigation {
  title: string;
  items: DocNavItem[];
}

export interface DocNavItem {
  title: string;
  href: string;
  isActive?: boolean;
  children?: DocNavItem[];
}

const docsDirectory = path.resolve(process.cwd(), "..", "docs");

function normalizeSlug(slug: string): string {
  return slug
    .replace(/\\/g, "/")
    .replace(/^\//, "")
    .replace(/\.md$/, "")
    .replace(/\/index$/, "");
}

function slugToFilePath(slug: string): string {
  const cleanSlug = normalizeSlug(slug);
  return path.join(docsDirectory, `${cleanSlug}.md`);
}

function toTitleCase(value: string): string {
  return value
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function createHeadingId(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[`*_~[\]()]/g, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function extractHeadings(content: string): Heading[] {
  const headings: Heading[] = [];
  const slugger = new GithubSlugger();

  for (const line of content.split("\n")) {
    const match = line.match(/^(#{1,6})\s+(.+)$/);

    if (!match) continue;

    const level = match[1].length;
    const rawText = match[2].replace(/#+$/, "").trim();

    if (!rawText) continue;

    const text = rawText
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .trim();

    headings.push({
      id: slugger.slug(text),
      text,
      level,
    });
  }

  return headings;
}

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function getAllMarkdownFiles(
  dir: string,
  basePath = "",
): Promise<string[]> {
  if (!(await pathExists(dir))) {
    return [];
  }

  const entries = await fs.readdir(dir, { withFileTypes: true });

  // Sort entries: files first, then folders, both in ascending order
  const sortedEntries = entries.sort((a, b) => {
    // Files come before folders
    if (a.isFile() && b.isDirectory()) return -1;
    if (a.isDirectory() && b.isFile()) return 1;

    // Both are files or both are folders - sort by name ascending
    return a.name.localeCompare(b.name);
  });

  const slugs: string[] = [];

  for (const entry of sortedEntries) {
    if (entry.name.startsWith(".")) continue;

    const fullPath = path.join(dir, entry.name);
    const relativePath = path.join(basePath, entry.name);

    if (entry.isDirectory()) {
      const nested = await getAllMarkdownFiles(fullPath, relativePath);
      slugs.push(...nested);
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".md")) {
      slugs.push(normalizeSlug(relativePath));
    }
  }

  return slugs.sort((a, b) => a.localeCompare(b));
}

function getDocTitle(slug: string, frontmatter: DocFrontmatter): string {
  if (typeof frontmatter.title === "string" && frontmatter.title.trim()) {
    return frontmatter.title.trim();
  }

  const lastPart = slug.split("/").filter(Boolean).pop();

  return lastPart ? toTitleCase(lastPart) : "Untitled";
}

function isPublished(frontmatter: DocFrontmatter): boolean {
  return frontmatter.published !== false;
}

function toDocSummary(doc: Doc): Pick<Doc, "slug" | "title" | "description"> {
  return {
    slug: doc.slug,
    title: doc.title,
    description: doc.description,
  };
}

async function loadDoc(slug: string): Promise<Doc | null> {
  const normalizedSlug = normalizeSlug(slug);

  try {
    const fullPath = slugToFilePath(normalizedSlug);
    const fileContents = await fs.readFile(fullPath, "utf8");
    const parsed = matter(fileContents);

    const frontmatter = parsed.data as DocFrontmatter;
    const content = parsed.content.trim();

    if (!isPublished(frontmatter)) {
      return null;
    }

    return {
      slug: normalizedSlug,
      title: getDocTitle(normalizedSlug, frontmatter),
      description:
        typeof frontmatter.description === "string"
          ? frontmatter.description
          : undefined,
      content,
      frontmatter,
      headings: extractHeadings(content),
    };
  } catch (error) {
    console.error(`Failed to load doc "${normalizedSlug}":`, error);
    return null;
  }
}

function sortDocs(docs: Doc[]): Doc[] {
  return [...docs].sort((a, b) => {
    const orderA = a.frontmatter.order ?? Number.POSITIVE_INFINITY;
    const orderB = b.frontmatter.order ?? Number.POSITIVE_INFINITY;

    if (orderA !== orderB) {
      return orderA - orderB;
    }

    return a.title.localeCompare(b.title);
  });
}

async function loadAllDocs(): Promise<Doc[]> {
  const slugs = await getAllMarkdownFiles(docsDirectory);
  const docs = await Promise.all(slugs.map((slug) => loadDoc(slug)));

  return sortDocs(docs.filter((doc): doc is Doc => doc !== null));
}

function getNavigationDocs(
  currentSlug: string,
  allDocs: Doc[],
): {
  prev?: Pick<Doc, "slug" | "title" | "description">;
  next?: Pick<Doc, "slug" | "title" | "description">;
} {
  const normalizedSlug = normalizeSlug(currentSlug);
  const index = allDocs.findIndex((doc) => doc.slug === normalizedSlug);

  if (index === -1) {
    return {};
  }

  return {
    prev: index > 0 ? toDocSummary(allDocs[index - 1]) : undefined,
    next:
      index < allDocs.length - 1 ? toDocSummary(allDocs[index + 1]) : undefined,
  };
}

function getSectionTitle(section: string): string {
  return toTitleCase(section);
}

function generateNavigation(docs: Doc[]): DocNavigation[] {
  const sections = new Map<string, Doc[]>();

  for (const doc of docs) {
    const [section = "docs"] = doc.slug.split("/");
    const sectionKey = doc.frontmatter.group || section;

    const existing = sections.get(sectionKey) ?? [];
    existing.push(doc);
    sections.set(sectionKey, existing);
  }

  return Array.from(sections.entries())
    .sort(([a], [b]) => {
      // Extract numeric prefix for proper sorting
      const aMatch = a.match(/^(\d+)-/);
      const bMatch = b.match(/^(\d+)-/);

      if (aMatch && bMatch) {
        // Both have numeric prefixes - compare numerically
        const aNum = parseInt(aMatch[1], 10);
        const bNum = parseInt(bMatch[1], 10);
        return aNum - bNum;
      } else if (aMatch) {
        // Only a has numeric prefix - comes first
        return -1;
      } else if (bMatch) {
        // Only b has numeric prefix - comes first
        return 1;
      } else {
        // Neither has numeric prefix - alphabetical fallback
        return a.localeCompare(b);
      }
    })
    .map(([section, sectionDocs]) => ({
      title: getSectionTitle(section),
      items: sortDocs(sectionDocs).map((doc) => ({
        title: doc.title,
        href: `/docs/${doc.slug}`,
      })),
    }));
}

export async function generateStaticParams(): Promise<{ doc: string[] }[]> {
  const docs = await loadAllDocs();

  return docs.map((doc) => ({
    doc: doc.slug.split("/").filter(Boolean),
  }));
}

export async function getDocBySlug(slug: string): Promise<Doc | null> {
  const normalizedSlug = normalizeSlug(slug);
  const allDocs = await loadAllDocs();
  const doc = allDocs.find((item) => item.slug === normalizedSlug);

  if (!doc) {
    return null;
  }

  const { prev, next } = getNavigationDocs(normalizedSlug, allDocs);

  return {
    ...doc,
    prev,
    next,
  };
}

export async function getAllDocsForNavigation(): Promise<DocNavigation[]> {
  const docs = await loadAllDocs();
  return generateNavigation(docs);
}

export function generateDocMetadata(doc: Doc): {
  title: string;
  description: string;
} {
  return {
    title: `${doc.title} - CodePurify Documentation`,
    description: doc.description ?? `Documentation for ${doc.title}`,
  };
}

export async function searchDocs(query: string): Promise<Doc[]> {
  const trimmedQuery = query.trim().toLowerCase();

  if (!trimmedQuery) {
    return [];
  }

  const allDocs = await loadAllDocs();

  return allDocs.filter((doc) => {
    const searchableText = [doc.title, doc.description, doc.content, doc.slug]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchableText.includes(trimmedQuery);
  });
}

function getFolderOrder(folder?: string): number {
  if (!folder) return 0;

  const match = folder.match(/^(\d+)\.-/);
  return match ? Number(match[1]) : Number.POSITIVE_INFINITY;
}

function cleanFolderName(folder?: string): string {
  if (!folder) return "";
  return folder.replace(/-/g, " ");
}

export async function getAllDocs(): Promise<DocItem[]> {
  const allDocs = await loadAllDocs();

  // Group docs by folder
  const grouped = allDocs.reduce(
    (acc, doc) => {
      const parts = doc.slug.split("/");
      const folder = parts.length > 1 ? parts[0] : undefined;

      if (!folder) {
        acc.ungrouped.push(doc);
      } else {
        if (!acc.groups[folder]) {
          acc.groups[folder] = [];
        }
        acc.groups[folder].push(doc);
      }

      return acc;
    },
    { groups: {} as Record<string, Doc[]>, ungrouped: [] as Doc[] },
  );

  // Sort groups by folder order
  const sortedGroups = Object.entries(grouped.groups).sort(([a], [b]) => {
    return getFolderOrder(a) - getFolderOrder(b);
  });

  // Sort docs within each group by order frontmatter, then by title
  for (const [, docs] of sortedGroups) {
    sortDocs(docs);
  }

  // Sort ungrouped docs
  sortDocs(grouped.ungrouped);

  // Convert to DocItem format
  const result: DocItem[] = [];

  // Add ungrouped docs first (like quick-guide.md)
  result.push(
    ...grouped.ungrouped.map((doc) => ({
      slug: doc.slug,
      title: doc.title,
      description: doc.description,
      group: undefined,
    })),
  );

  // Add grouped docs after
  for (const [folder, docs] of sortedGroups) {
    const cleanName = cleanFolderName(folder);

    result.push(
      ...docs.map((doc) => ({
        slug: doc.slug,
        title: doc.title,
        description: doc.description,
        group: cleanName,
      })),
    );
  }

  return result;
}
