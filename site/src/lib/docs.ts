import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import { notFound } from "next/navigation";

export interface DocFrontmatter {
  title?: string;
  description?: string;
  order?: number;
  published?: boolean;
  lastModified?: string;
  [key: string]: any;
}

export interface Doc {
  slug: string;
  title: string;
  description?: string;
  content: string;
  frontmatter: DocFrontmatter;
  headings: Heading[];
  prev?: Doc;
  next?: Doc;
}

export interface Heading {
  id: string;
  text: string;
  level: number;
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

const docsDirectory = path.join(process.cwd(), "..", "docs");

// Extract headings from markdown content
function extractHeadings(content: string): Heading[] {
  const headings: Heading[] = [];
  const lines = content.split("\n");

  for (const line of lines) {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");

      headings.push({ id, text, level });
    }
  }

  return headings;
}

// Get all markdown files recursively
async function getAllMarkdownFiles(
  dir: string,
  basePath: string = "",
): Promise<string[]> {
  const files: string[] = [];

  try {
    const items = await fs.readdir(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = await fs.stat(fullPath);

      if (stat.isDirectory()) {
        files.push(
          ...(await getAllMarkdownFiles(fullPath, path.join(basePath, item))),
        );
      } else if (item.endsWith(".md")) {
        const relativePath = path.join(basePath, item.replace(".md", ""));
        files.push(relativePath);
      }
    }
  } catch (error) {
    // Directory doesn't exist or is not accessible
    console.warn(`Warning: Could not read directory ${dir}:`, error);
  }

  return files;
}

// Load and parse a single doc
async function loadDoc(slug: string): Promise<Doc | null> {
  try {
    const fullPath = path.join(docsDirectory, `${slug}.md`);

    const fileContents = await fs.readFile(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    const headings = extractHeadings(content);

    return {
      slug,
      title: data.title || slug.split("/").pop() || "Untitled",
      description: data.description,
      content: content,
      frontmatter: data,
      headings,
    };
  } catch (error) {
    console.error(`Error loading doc ${slug}:`, error);
    return null;
  }
}

// Load all docs
async function loadAllDocs(): Promise<Doc[]> {
  const slugs = await getAllMarkdownFiles(docsDirectory);
  const docs = await Promise.all(
    slugs.map(async (slug) => {
      const doc = await loadDoc(slug);
      return doc;
    }),
  );

  // Filter out nulls and unpublished docs
  const validDocs = docs.filter(
    (doc): doc is Doc => doc !== null && doc.frontmatter.published !== false,
  );

  // Sort by order then by title
  return validDocs.sort((a, b) => {
    const orderA = a.frontmatter.order ?? Infinity;
    const orderB = b.frontmatter.order ?? Infinity;

    if (orderA !== orderB) {
      return orderA - orderB;
    }

    return a.title.localeCompare(b.title);
  });
}

// Get previous and next docs for navigation
function getNavigationDocs(
  currentSlug: string,
  allDocs: Doc[],
): { prev?: Doc; next?: Doc } {
  const index = allDocs.findIndex((doc) => doc.slug === currentSlug);

  if (index === -1) {
    return { prev: undefined, next: undefined };
  }

  return {
    prev: index > 0 ? allDocs[index - 1] : undefined,
    next: index < allDocs.length - 1 ? allDocs[index + 1] : undefined,
  };
}

// Generate navigation structure
function generateNavigation(docs: Doc[]): DocNavigation[] {
  const navigation: DocNavigation[] = [];
  const sections = new Map<string, Doc[]>();

  // Group docs by section (first part of slug)
  for (const doc of docs) {
    const parts = doc.slug.split("/");
    const section = parts[0];

    if (!sections.has(section)) {
      sections.set(section, []);
    }
    sections.get(section)!.push(doc);
  }

  // Create navigation structure
  for (const [section, sectionDocs] of sections) {
    const items: DocNavItem[] = sectionDocs.map((doc) => ({
      title: doc.title,
      href: `/docs/${doc.slug}`,
    }));

    navigation.push({
      title: section.charAt(0).toUpperCase() + section.slice(1),
      items,
    });
  }

  return navigation;
}

// Generate static params for dynamic routes
export async function generateStaticParams(): Promise<{ doc: string[] }[]> {
  const slugs = await getAllMarkdownFiles(docsDirectory);
  return slugs.map((slug) => ({ doc: slug.split("/") }));
}

// Get doc by slug with navigation
export async function getDocBySlug(slug: string): Promise<Doc | null> {
  const doc = await loadDoc(slug);

  if (!doc) {
    return null;
  }

  const allDocs = await loadAllDocs();
  const { prev, next } = getNavigationDocs(slug, allDocs);

  return {
    ...doc,
    prev,
    next,
  };
}

// Get all docs for navigation
export async function getAllDocsForNavigation(): Promise<DocNavigation[]> {
  const docs = await loadAllDocs();
  return generateNavigation(docs);
}

// Generate metadata for a doc
export function generateDocMetadata(doc: Doc): {
  title: string;
  description: string;
} {
  return {
    title: `${doc.title} - CodePurify Documentation`,
    description: doc.description || `Documentation for ${doc.title}`,
  };
}

// Search docs (simple text search)
export async function searchDocs(query: string): Promise<Doc[]> {
  const allDocs = await loadAllDocs();
  const lowercaseQuery = query.toLowerCase();

  return allDocs.filter(
    (doc) =>
      doc.title.toLowerCase().includes(lowercaseQuery) ||
      doc.description?.toLowerCase().includes(lowercaseQuery) ||
      doc.content.toLowerCase().includes(lowercaseQuery),
  );
}

// Get all docs for index page (simplified metadata)
export async function getAllDocs(): Promise<
  Array<{
    slug: string;
    title: string;
    description?: string;
  }>
> {
  const allDocs = await loadAllDocs();

  return allDocs.map((doc) => ({
    slug: doc.slug,
    title: doc.title,
    description: doc.description,
  }));
}
