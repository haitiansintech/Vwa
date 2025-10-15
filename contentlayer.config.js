import { defineDocumentType, makeSource } from "contentlayer/source-files"
import { z } from "zod"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import rehypePrettyCode from "rehype-pretty-code"
import rehypeSlug from "rehype-slug"
import remarkGfm from "remark-gfm"

const gfmTableGuardSymbol = Symbol("remark-gfm-table-guard")
const rehypePrettyCodeOptions = {
  theme: "github-dark",
  onVisitHighlightedLine(node) {
    node.properties ||= {}
    node.properties.className ||= []
    node.properties.className.push("line--highlighted")
  },
  onVisitHighlightedWord(node) {
    node.properties ||= {}
    node.properties.className ||= []
    node.properties.className.push("word--highlighted")
  },
}

function remarkGfmTableGuard() {
  const data = this?.data?.()

  if (!data) {
    return
  }

  const queue = Array.isArray(data.fromMarkdownExtensions)
    ? [...data.fromMarkdownExtensions]
    : []

  const wrap = (fn) => {
    if (typeof fn !== "function" || fn[gfmTableGuardSymbol]) {
      return fn
    }

    const guarded = function guardedHandler(...args) {
      if (this && typeof this === "object") {
        this.data ||= {}
      }

      return fn.apply(this, args)
    }

    guarded[gfmTableGuardSymbol] = true

    return guarded
  }

  while (queue.length > 0) {
    const extension = queue.shift()

    if (Array.isArray(extension)) {
      queue.push(...extension)
      continue
    }

    if (!extension || typeof extension !== "object") {
      continue
    }

    if (extension.enter && typeof extension.enter === "object") {
      for (const key of Object.keys(extension.enter)) {
        extension.enter[key] = wrap(extension.enter[key])
      }
    }

    if (extension.exit && typeof extension.exit === "object") {
      for (const key of Object.keys(extension.exit)) {
        extension.exit[key] = wrap(extension.exit[key])
      }
    }
  }
}

/** @type {import('contentlayer/source-files').ComputedFields} */
const computedFields = {
  slug: {
    type: "string",
    resolve: (doc) => `/${doc._raw.flattenedPath}`,
  },
  slugAsParams: {
    type: "string",
    resolve: (doc) => doc._raw.flattenedPath.split("/").slice(1).join("/"),
  },
}

export const Doc = defineDocumentType(() => ({
  name: "Doc",
  filePathPattern: `docs/**/*.mdx`,
  contentType: "mdx",
  fields: {
    title: {
      type: "string",
      required: true,
    },
    description: {
      type: "string",
    },
    date: {
      type: "date",
      required: true,
    },
    published: {
      type: "boolean",
      default: true,
    },
  },
  computedFields,
  extensions: {
    schema: (schema) =>
      schema.extend({
        date: z.union([z.string(), z.date()]).transform((value) => new Date(value)),
      }),
  },
}))

export const Guide = defineDocumentType(() => ({
  name: "Guide",
  filePathPattern: `guides/**/*.mdx`,
  contentType: "mdx",
  fields: {
    title: {
      type: "string",
      required: true,
    },
    description: {
      type: "string",
    },
    date: {
      type: "date",
      required: true,
    },
    published: {
      type: "boolean",
      default: true,
    },
    featured: {
      type: "boolean",
      default: false,
    },
  },
  computedFields,
  extensions: {
    schema: (schema) =>
      schema.extend({
        date: z.union([z.string(), z.date()]).transform((value) => new Date(value)),
      }),
  },
}))

export const Post = defineDocumentType(() => ({
  name: "Post",
  filePathPattern: `blog/**/*.mdx`,
  contentType: "mdx",
  fields: {
    title: {
      type: "string",
      required: true,
    },
    description: {
      type: "string",
    },
    date: {
      type: "date",
      required: true,
    },
    published: {
      type: "boolean",
      default: true,
    },
    image: {
      type: "string",
      required: true,
    },
    authors: {
      // Reference types are not embedded.
      // Until this is fixed, we can use a simple list.
      // type: "reference",
      // of: Author,
      type: "list",
      of: { type: "string" },
      required: true,
    },
  },
  computedFields,
}))

export const Author = defineDocumentType(() => ({
  name: "Author",
  filePathPattern: `authors/**/*.mdx`,
  contentType: "mdx",
  fields: {
    title: {
      type: "string",
      required: true,
    },
    description: {
      type: "string",
    },
    avatar: {
      type: "string",
      required: true,
    },
    twitter: {
      type: "string",
      required: true,
    },
  },
  computedFields,
}))

export const Page = defineDocumentType(() => ({
  name: "Page",
  filePathPattern: `pages/**/*.mdx`,
  contentType: "mdx",
  fields: {
    title: {
      type: "string",
      required: true,
    },
    description: {
      type: "string",
    },
  },
  computedFields,
}))

export default makeSource({
  contentDirPath: "./content",
  documentTypes: [Page, Doc, Guide, Post, Author],
  mdx: {
    remarkPlugins: [remarkGfm, remarkGfmTableGuard],
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
