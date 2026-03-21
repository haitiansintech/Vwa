import { defineCollection, defineConfig, s } from "velite"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import rehypePrettyCode from "rehype-pretty-code"
import rehypeSlug from "rehype-slug"
import remarkGfm from "remark-gfm"

const rehypePrettyCodeOptions = {
  theme: "github-dark",
  onVisitHighlightedLine(node: any) {
    node.properties ||= {}
    node.properties.className ||= []
    node.properties.className.push("line--highlighted")
  },
  onVisitHighlightedWord(node: any) {
    node.properties ||= {}
    node.properties.className ||= []
    node.properties.className.push("word--highlighted")
  },
}

const allDocs = defineCollection({
  name: "Doc",
  pattern: "docs/**/*.mdx",
  schema: s.object({
    title: s.string(),
    description: s.string().optional(),
    date: s.isodate(),
    published: s.boolean().default(true),
    body: s.mdx(),
    raw: s.raw(),
    slug: s.path().transform((v) => `/${v}`),
    slugAsParams: s.path().transform((v) => v.split("/").slice(1).join("/")),
  }),
})

const allGuides = defineCollection({
  name: "Guide",
  pattern: "guides/**/*.mdx",
  schema: s.object({
    title: s.string(),
    description: s.string().optional(),
    date: s.isodate(),
    published: s.boolean().default(true),
    featured: s.boolean().default(false),
    body: s.mdx(),
    raw: s.raw(),
    slug: s.path().transform((v) => `/${v}`),
    slugAsParams: s.path().transform((v) => v.split("/").slice(1).join("/")),
  }),
})

const allPosts = defineCollection({
  name: "Post",
  pattern: "blog/**/*.mdx",
  schema: s.object({
    title: s.string(),
    description: s.string().optional(),
    date: s.isodate(),
    published: s.boolean().default(true),
    image: s.string(),
    authors: s.array(s.string()),
    body: s.mdx(),
    raw: s.raw(),
    slug: s.path().transform((v) => `/${v}`),
    slugAsParams: s.path().transform((v) => v.split("/").slice(1).join("/")),
  }),
})

const allAuthors = defineCollection({
  name: "Author",
  pattern: "authors/**/*.mdx",
  schema: s.object({
    title: s.string(),
    description: s.string().optional(),
    avatar: s.string(),
    twitter: s.string(),
    body: s.mdx(),
    raw: s.raw(),
    slug: s.path().transform((v) => `/${v}`),
    slugAsParams: s.path().transform((v) => v.split("/").slice(1).join("/")),
  }),
})

const allPages = defineCollection({
  name: "Page",
  pattern: "pages/**/*.mdx",
  schema: s.object({
    title: s.string(),
    description: s.string().optional(),
    body: s.mdx(),
    raw: s.raw(),
    slug: s.path().transform((v) => `/${v}`),
    slugAsParams: s.path().transform((v) => v.split("/").slice(1).join("/")),
  }),
})

export default defineConfig({
  root: "content",
  output: {
    data: ".velite",
    assets: "public/static",
    base: "/static/",
    name: "[name]-[hash:6].[ext]",
    clean: true,
  },
  collections: { allDocs, allGuides, allPosts, allAuthors, allPages },
  mdx: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [rehypePrettyCode, rehypePrettyCodeOptions],
      [
        rehypeAutolinkHeadings,
        {
          properties: {
            className: ["subheading-anchor"],
            ariaLabel: "Link to section",
          },
        },
      ],
    ],
  },
})
