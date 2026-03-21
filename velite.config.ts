/**
 * esbuild (used internally by velite) cannot follow Windows directory
 * junctions created by pnpm. Any static or dynamic import of "velite" by
 * string literal causes esbuild to analyze the junction, find no exports,
 * and replace every named import with `void 0`.
 *
 * Fix: use createRequire to resolve velite's real absolute path via Node.js's
 * CJS resolver (which handles junctions correctly), convert it to a file URL,
 * then import() from that URL. Because the import target is a runtime variable
 * — not a string literal — esbuild never tries to analyze it.
 */
import { createRequire } from "module"
import { pathToFileURL } from "url"
const _require = createRequire(import.meta.url)
const veliteUrl = pathToFileURL(_require.resolve("velite")).href
const { defineCollection, defineConfig, s } = await import(veliteUrl)

import rehypeAutolinkHeadings from "rehype-autolink-headings"
import rehypePrettyCode from "rehype-pretty-code"
import rehypeSlug from "rehype-slug"
import remarkGfm from "remark-gfm"

const rehypePrettyCodeOptions = {
  theme: "github-dark",
  onVisitLine(node: any) {
    if (node.children.length === 0) {
      node.children = [{ type: "text", value: " " }]
    }
  },
  onVisitHighlightedLine(node: any) {
    node.properties.className.push("line--highlighted")
  },
  onVisitHighlightedWord(node: any) {
    node.properties.className = ["word--highlighted"]
  },
}

// Static content pages (about, privacy, terms, resources, why-this-election-matters, etc.)
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

// Long-form resource and explainer content
const allResources = defineCollection({
  name: "Resource",
  pattern: "resources/**/*.mdx",
  schema: s.object({
    title: s.string(),
    description: s.string().optional(),
    category: s.string().optional(),
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
  collections: { allPages, allResources },
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
