// scripts/fix-frontmatter.ts
// Repairs MDX front-matter (bad fences, quoted dates, CRLF) for Contentlayer.
// Usage: pnpm ts-node --transpile-only scripts/fix-frontmatter.ts

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { globby } from 'globby';
import matter from 'gray-matter';
import stripBom from 'strip-bom';

const ROOT = process.cwd();
const TARGET_DIRS = ['content/docs', 'content/guides']; // add others if needed
const PRETTIER_TARGETS = new Set([
  'content/docs/in-progress.mdx',
  'content/docs/index.mdx',
  'content/docs/documentation/code-blocks.mdx',
  'content/docs/documentation/components.mdx',
  'content/docs/documentation/index.mdx',
  'content/docs/documentation/style-guide.mdx',
  'content/guides/build-blog-using-contentlayer-mdx.mdx',
  'content/guides/using-next-auth-next-13.mdx',
]);

function toLF(input: string) {
  return input.replace(/\r\n/g, '\n');
}

function coerceIsoDate(val: unknown): string | undefined {
  if (!val) return undefined;
  if (val instanceof Date) return val.toISOString().slice(0, 10);
  if (typeof val === 'string') {
    const s = val.trim().replace(/^"+|"+$/g, ''); // strip surrounding quotes
    // Accept YYYY-MM-DD or full ISO
    const d = new Date(s);
    if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  }
  return undefined;
}

async function run() {
  const patterns = TARGET_DIRS.map((d) => `${d}/**/*.mdx`);
  const files = await globby(patterns, { cwd: ROOT, gitignore: true });

  let fixed = 0;
  let skipped = 0;
  const prettifyQueue = new Set<string>();

  for (const rel of files) {
    const abs = path.join(ROOT, rel);
    let raw = fs.readFileSync(abs, 'utf8');

    // Normalize to LF first and strip BOM (common Windows issues)
    raw = toLF(stripBom(raw));

    // Ensure the file starts with front-matter fences; if not, add a minimal one.
    let contentToParse = raw;
    if (!raw.startsWith('---\n')) {
      contentToParse = `---\n---\n${raw}`;
    }

    let parsed;
    try {
      parsed = matter(contentToParse);
    } catch (e) {
      // If still failing, try to salvage by forcing a minimal valid front-matter
      const body = raw.replace(/^---[\s\S]*?---\n?/, '');
      const fm = {
        title: '',
        date: '',
        summary: '',
        tags: [],
        draft: false,
      };
      const repaired = matter.stringify(toLF(body), fm);
      fs.writeFileSync(abs, repaired, 'utf8');
      PRETTIER_TARGETS.has(rel) && prettifyQueue.add(rel);
      fixed++;
      continue;
    }

    const data = { ...parsed.data };

    // Coerce date to ISO YYYY-MM-DD (unquoted)
    if (data.date !== undefined) {
      const iso = coerceIsoDate(data.date);
      if (iso) data.date = iso;
      else delete data.date; // remove invalid date to avoid parsing errors
    }

    // Default other fields if missing (non-destructive)
    if (data.tags === undefined) data.tags = [];
    if (data.draft === undefined) data.draft = false;

    // Re-emit front-matter cleanly with LF endings
    const next = matter.stringify(toLF(parsed.content), data);
    if (next !== raw) {
      fs.writeFileSync(abs, next, 'utf8');
      PRETTIER_TARGETS.has(rel) && prettifyQueue.add(rel);
      fixed++;
    } else {
      skipped++;
    }
  }

  if (prettifyQueue.size > 0) {
    const args = Array.from(prettifyQueue).map((file) => JSON.stringify(file)).join(' ');
    execSync(`pnpm prettier --write ${args}`, { stdio: 'inherit', cwd: ROOT });
  }

  // Prettify console output
  // eslint-disable-next-line no-console
  console.log(`Front-matter repair complete. Fixed: ${fixed}, Unchanged: ${skipped}`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
