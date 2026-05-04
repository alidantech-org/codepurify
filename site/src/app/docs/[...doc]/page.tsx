import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { serialize } from "next-mdx-remote/serialize";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import { DocsToc } from "@/components/docs/DocsToc";
import { DocsPager } from "@/components/docs/DocsPager";
import { MarkdownRenderer } from "@/components/docs/MarkdownRenderer";
import {
  getDocBySlug,
  generateStaticParams,
  generateDocMetadata,
} from "@/lib/docs";

interface DocPageProps {
  params: Promise<{
    doc: string[];
  }>;
}

export { generateStaticParams };

export async function generateMetadata({
  params,
}: DocPageProps): Promise<Metadata> {
  const { doc } = await params;
  const slug = doc.join("/");
  const page = await getDocBySlug(slug);

  if (!page) {
    return {
      title: "Not Found - CodePurify Documentation",
      description: "The requested documentation page was not found.",
    };
  }

  return generateDocMetadata(page);
}

export default async function DocPage({ params }: DocPageProps) {
  const { doc } = await params;
  const slug = doc.join("/");
  const page = await getDocBySlug(slug);

  if (!page) {
    notFound();
  }

  const source = await serialize(page.content, {
    mdxOptions: {
      remarkPlugins: [remarkGfm],
      rehypePlugins: [
        rehypeSlug,
        [
          rehypeAutolinkHeadings,
          {
            behavior: "wrap",
          },
        ],
        [
          rehypePrettyCode,
          {
            theme: {
              light: "github-light",
              dark: "github-dark-dimmed",
            },
            keepBackground: false,
          },
        ],
      ],
    },
  });

  return (
    <>
      {/* TOC for right sidebar - positioned at top of right sidebar */}
      <div className="hidden xl:block fixed top-20 right-4 w-[240px]">
        <DocsToc headings={page.headings} />
      </div>

      {/* Main content */}
      <article className="px-4 md:px-6">
        <div className="mb-10 border-b border-border pb-8">
          <p className="mb-3 font-mono text-xs uppercase tracking-widest text-primary">
            Documentation
          </p>

          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            {page.title}
          </h1>

          {page.description && (
            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              {page.description}
            </p>
          )}
        </div>

        <MarkdownRenderer source={source} />

        <DocsPager doc={page} />
      </article>
    </>
  );
}
