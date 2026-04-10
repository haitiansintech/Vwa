import { notFound } from "next/navigation"
import { allPages } from "#velite"

import { getTableOfContents } from "@/lib/toc"
import { Mdx } from "@/components/mdx-components"
import { DocsPageHeader } from "@/components/page-header"
import { DashboardTableOfContents } from "@/components/toc"

import "@/styles/mdx.css"
import type { Metadata } from "next"

interface PageProps {
  params: {
    slug: string[]
  }
}

async function getPageFromParams(params: { slug?: string[] }) {
  const slug = params.slug?.join("/") || ""
  return allPages.find((page) => page.slugAsParams === slug) ?? null
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const page = await getPageFromParams(params)
  if (!page) return {}

  return {
    title: page.title,
    description: page.description,
  }
}

export async function generateStaticParams(): Promise<PageProps["params"][]> {
  return allPages.map((page) => ({
    slug: page.slugAsParams.split("/"),
  }))
}

export default async function DocPage({ params }: PageProps) {
  const page = await getPageFromParams(params)
  if (!page) notFound()

  const toc = await getTableOfContents(page.raw)

  return (
    <main className="relative py-6 lg:gap-10 lg:py-10 xl:grid xl:grid-cols-[1fr_300px]">
      <div className="mx-auto w-full min-w-0">
        <DocsPageHeader heading={page.title} text={page.description} />
        <Mdx code={page.body} />
        <hr className="my-4 md:my-6" />
      </div>
      <div className="hidden text-sm xl:block">
        <div className="sticky top-16 -mt-10 max-h-[calc(var(--vh)-4rem)] overflow-y-auto pt-10">
          <DashboardTableOfContents toc={toc} />
        </div>
      </div>
    </main>
  )
}
