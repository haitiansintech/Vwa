import fs from "node:fs/promises"
import type { Dirent } from "node:fs"
import path from "node:path"

type FrontmatterRecord = Record<string, unknown>
type MatterLike = (input: string) => { data?: FrontmatterRecord; content: string }

const ROOT = process.cwd()
const TARGET_DIRECTORIES = [path.join(ROOT, "content", "docs"), path.join(ROOT, "content", "guides")]

async function main() {
  const files = (
    await Promise.all(TARGET_DIRECTORIES.map(async (dir) => collectMdxFiles(dir)))
  ).flat()

  const updated: string[] = []

  for (const filePath of files) {
    const originalBuffer = await fs.readFile(filePath)
    const originalContent = originalBuffer.toString("utf8")

    const normalizedContent = normalizeContent(originalContent)

    const { data, body, parseError } = parseFrontmatter(normalizedContent, matterParser)

    const rebuilt = rebuildFrontmatter(filePath, data, body)

    if (rebuilt !== normalizedContent) {
      await fs.writeFile(filePath, rebuilt, "utf8")
      updated.push(path.relative(ROOT, filePath))
    } else if (parseError) {
      // Parsing failed but rebuilding produced the same content. Ensure file is rewritten.
      await fs.writeFile(filePath, rebuilt, "utf8")
      updated.push(path.relative(ROOT, filePath))
    }
  }

  if (updated.length === 0) {
    console.log("No front matter fixes were necessary.")
  } else {
    console.log("Fixed front matter for:")
    for (const file of updated) {
      console.log(` - ${file}`)
    }
  }
}

async function collectMdxFiles(dir: string): Promise<string[]> {
  let dirEntries: Dirent[]

  try {
    dirEntries = await fs.readdir(dir, { withFileTypes: true })
  } catch (error) {
    return []
  }

  const files: string[] = []

  for (const entry of dirEntries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      files.push(...(await collectMdxFiles(fullPath)))
      continue
    }

    if (entry.isFile() && fullPath.endsWith(".mdx")) {
      files.push(fullPath)
    }
  }

  return files
}

function normalizeContent(content: string): string {
  let normalized = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n")
  normalized = normalized.replace(/^\uFEFF/, "")
  return normalized
}

function sanitizeFrontmatterBlock(block: string): string {
  return block.replace(/\u00a0/g, " ").replace(/\t/g, " ")
}

function parseFrontmatter(content: string, matter: MatterLike): {
  data: FrontmatterRecord
  body: string
  parseError: unknown | null
} {
  const sanitizedForParsing = sanitizeContentFrontmatter(content)
  try {
    const parsed = matter(sanitizedForParsing)
    return {
      data: parsed.data as FrontmatterRecord,
      body: parsed.content,
      parseError: null,
    }
  } catch (error) {
    const fallback = fallbackParse(sanitizedForParsing)
    return {
      data: fallback.data,
      body: fallback.body,
      parseError: error,
    }
  }
}

function sanitizeContentFrontmatter(content: string): string {
  if (!content.startsWith("---")) {
    return content
  }

  const match = /^---\n([\s\S]*?)\n---/.exec(content)
  if (!match) {
    return content
  }

  const [, block] = match
  const sanitizedBlock = sanitizeFrontmatterBlock(block)
  return `---\n${sanitizedBlock}\n---${content.slice(match[0].length)}`
}

function fallbackParse(content: string): { data: FrontmatterRecord; body: string } {
  const match = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/m.exec(content)

  if (!match) {
    return { data: {}, body: content }
  }

  const [, rawFrontmatter, body] = match
  const cleaned = sanitizeFrontmatterBlock(rawFrontmatter)
  const lines = cleaned.split("\n")

  const data: FrontmatterRecord = {}

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) {
      continue
    }

    const separatorIndex = trimmed.indexOf(":")
    if (separatorIndex === -1) {
      continue
    }

    const key = trimmed.slice(0, separatorIndex).trim()
    const rawValue = trimmed.slice(separatorIndex + 1).trim()

    if (!key) {
      continue
    }

    data[key] = stripWrappingQuotes(rawValue)
  }

  return { data, body }
}

function loadMatter(): MatterLike {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment
    const required = require("gray-matter") as MatterLike | { default?: MatterLike }

    if (typeof required === "function") {
      return required as MatterLike
    }

    if (required && typeof required === "object" && typeof required.default === "function") {
      return required.default as MatterLike
    }
  } catch (error) {
    // Module not available in the current environment; fallback parser will handle parsing.
  }

  return fallbackMatter
}

const fallbackMatter: MatterLike = (input) => {
  const parsed = fallbackParse(input)
  return { data: parsed.data, content: parsed.body }
}

const matterParser = loadMatter()

function stripWrappingQuotes(value: string): string {
  if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1)
  }

  return value
}

function rebuildFrontmatter(filePath: string, data: FrontmatterRecord, body: string): string {
  const frontmatterLines: string[] = ["---"]

  const fallbackTitle = createTitleFromFilename(filePath)
  const title = stringOrNull(data.title) ?? fallbackTitle
  frontmatterLines.push(`title: ${quoteString(title)}`)

  const formattedDate = formatDateValue(data.date)
  frontmatterLines.push(`date: ${formattedDate}`)

  const summaryValue = stringOrNull(data.summary) ?? stringOrNull(data.description) ?? ""
  const summary = typeof summaryValue === "string" ? summaryValue.trim() : ""
  frontmatterLines.push(`summary: ${quoteString(summary)}`)

  const descriptionValue = stringOrNull(data.description)
  const description = descriptionValue !== null ? descriptionValue.trim() : null
  if (description !== null) {
    frontmatterLines.push(`description: ${quoteString(description)}`)
  }

  const tags = normalizeTags(data.tags)
  frontmatterLines.push(`tags: ${formatTags(tags)}`)

  const draft = normalizeDraft(data)
  frontmatterLines.push(`draft: ${draft ? "true" : "false"}`)

  appendPreservedKeys(data, frontmatterLines, new Set(["title", "date", "summary", "description", "tags", "draft"]))

  frontmatterLines.push("---")

  let cleanedBody = body.replace(/\r\n/g, "\n")
  cleanedBody = cleanedBody.replace(/^\uFEFF/, "")

  if (cleanedBody.startsWith("\n")) {
    cleanedBody = cleanedBody.slice(1)
  }

  const frontmatterBlock = frontmatterLines.join("\n")
  const finalContent = cleanedBody.length > 0 ? `${frontmatterBlock}\n\n${cleanedBody}` : `${frontmatterBlock}\n`

  return finalContent.endsWith("\n") ? finalContent : `${finalContent}\n`
}

function appendPreservedKeys(data: FrontmatterRecord, lines: string[], ignore: Set<string>) {
  for (const [key, value] of Object.entries(data)) {
    if (ignore.has(key)) {
      continue
    }

    if (value === undefined || value === null || value === "") {
      continue
    }

    if (typeof value === "boolean") {
      lines.push(`${key}: ${value ? "true" : "false"}`)
      continue
    }

    if (Array.isArray(value)) {
      lines.push(`${key}: ${formatTags(value.map((item) => String(item)))}`)
      continue
    }

    if (value instanceof Date) {
      lines.push(`${key}: ${formatDateValue(value)}`)
      continue
    }

    if (typeof value === "object") {
      lines.push(`${key}: ${quoteString(JSON.stringify(value))}`)
      continue
    }

    lines.push(`${key}: ${quoteString(String(value))}`)
  }
}

function normalizeDraft(data: FrontmatterRecord): boolean {
  if (typeof data.draft === "boolean") {
    return data.draft
  }

  if (typeof data.draft === "string") {
    const lowered = data.draft.trim().toLowerCase()
    if (lowered === "true" || lowered === "false") {
      return lowered === "true"
    }
  }

  if (typeof data.published === "boolean") {
    return !data.published
  }

  if (typeof data.published === "string") {
    const lowered = data.published.trim().toLowerCase()
    if (lowered === "true" || lowered === "false") {
      return lowered !== "true"
    }
  }

  return false
}

function normalizeTags(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((entry) => String(entry))
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0 && entry !== "[]")
  }

  if (typeof value === "string") {
    const trimmed = value.trim()

    if (trimmed.length === 0) {
      return []
    }

    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed)
        if (Array.isArray(parsed)) {
          return parsed
            .map((entry) => String(entry))
            .map((entry) => entry.trim())
            .filter((entry) => entry.length > 0 && entry !== "[]")
        }
      } catch (error) {
        // Fall back to comma-separated parsing
      }
    }

    return trimmed
      .split(",")
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0 && entry !== "[]")
  }

  return []
}

function formatTags(tags: string[]): string {
  if (tags.length === 0) {
    return "[]"
  }

  return `[${tags.map((tag) => quoteString(tag)).join(", ")}]`
}

function formatDateValue(value: unknown): string {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      return defaultDate()
    }

    return value.toISOString().slice(0, 10)
  }

  if (typeof value === "number") {
    const date = new Date(value)
    if (!Number.isNaN(date.getTime())) {
      return date.toISOString().slice(0, 10)
    }
  }

  if (typeof value === "string") {
    const trimmed = stripWrappingQuotes(value.trim())
    const parsed = new Date(trimmed)
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().slice(0, 10)
    }

    return trimmed
  }

  return defaultDate()
}

function defaultDate(): string {
  return "1970-01-01"
}

function stringOrNull(value: unknown): string | null {
  if (typeof value === "string") {
    return value
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : null
  }

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      return null
    }
    return value.toISOString()
  }

  return null
}

function quoteString(value: string): string {
  return JSON.stringify(value)
}

function createTitleFromFilename(filePath: string): string {
  const base = path.basename(filePath, path.extname(filePath))
  return base
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase())
}

main().catch((error) => {
  console.error("Failed to repair front matter:", error)
  process.exitCode = 1
})
