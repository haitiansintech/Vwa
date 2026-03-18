import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new McpServer({
    name: "vwa-mcp",
    version: "0.1.0",
});

server.tool(
    "repo_map",
    "Summarize this repo for an AI agent. Reads AI_CONTEXT.md and returns a structured summary.",
    {
        repoRoot: z.string().optional().describe("Absolute path to repo root. Defaults to process.cwd()."),
    },
    async ({ repoRoot }) => {
        const root = repoRoot ?? process.cwd();
        const ctxPath = path.join(root, "AI_CONTEXT.md");

        if (!fs.existsSync(ctxPath)) {
            return {
                content: [
                    {
                        type: "text",
                        text: `AI_CONTEXT.md not found at ${ctxPath}. Create it at repo root first.`,
                    },
                ],
            };
        }

        const aiContext = fs.readFileSync(ctxPath, "utf8");

        // Keep it simple: return the raw file plus a small structured header.
        const summary = {
            repoRoot: root,
            aiContextPath: ctxPath,
            notes: [
                "This tool is intentionally minimal. Next we will add: run_lint, run_typecheck, and search_files.",
                "We will also add a PRD alignment rule so agents ignore template residue like Stripe when out of scope.",
            ],
        };

        return {
            content: [
                { type: "text", text: JSON.stringify(summary, null, 2) },
                { type: "text", text: "\n\n---\n\n" },
                { type: "text", text: aiContext },
            ],
        };
    }
);

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
}

main().catch((err) => {
    console.error("MCP server error:", err);
    process.exit(1);
});