import { PullRequestRow } from "@repo/types";
import { createAnthropicClient } from "./client";
 import { config } from "@repo/config";
import type { SummaryResult } from "../types";
import { buildStandupPrompt } from "../utils/prompt";

export async function generateStandupSummaryWithAnthropic(
    prs: PullRequestRow[],
    org: string,
    repo: string
): Promise<SummaryResult> {


    const client = createAnthropicClient();
    const prompt = buildStandupPrompt(prs, org, repo);

    const message = await client.messages.create({
        model: config.ANTHROPIC_MODEL,
        max_tokens: 1024,
        messages: [{
            role: "user", content: prompt
        }]
    })

    const content = message.content
        .filter((b) => b.type === "text")
        .map((b) => (b as { type: "text"; text: string }).text)
        .join("");

    if (!content) throw new Error("Claude returned an empty response");


    return {
        content,
        prCount: prs.length,
        mergedCount: prs.filter((p) => p.status === "merged").length,
        inputTokens: message.usage.input_tokens,
        outputTokens: message.usage.output_tokens,
        generatedAt: new Date().toISOString(),
        provider: "anthropic",
    };
}
