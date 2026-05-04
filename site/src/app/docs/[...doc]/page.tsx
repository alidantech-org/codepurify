import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { serialize } from "next-mdx-remote/serialize";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import {
  generateDocMetadata,
  generateStaticParams,
  getDocBySlug,
} from "@/lib/docs";
import { MarkdownRenderer } from "@/components/docs/MarkdownRenderer";
import { DocsPager } from "@/components/docs/DocsPager";
import { TocRenderer } from "@/components/docs/TocRenderer";

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
            behavior: "append",
            properties: {
              className: ["anchor"],
              ariaLabel: "Link to section",
            },
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
      {/* TOC rendered via client component */}
      <TocRenderer headings={page.headings} />

      {/* Main content */}
      <article className="px-4 md:px-6">
        <MarkdownRenderer source={source} />
        <DocsPager doc={page} />
      </article>
    </>
  );
}
