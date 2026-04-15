import { PullRequestRow } from "@repo/types";
import { config } from "@repo/config";
import { buildStandupPrompt } from "../utils/prompt";
import { createGroqClient } from "./client";
import type { SummaryResult } from "../types";

export async function generateStandupSummaryWithGroq(
    prs: PullRequestRow[],
    org: string,
    repo: string
): Promise<SummaryResult> {


    const client = createGroqClient();
    const prompt = buildStandupPrompt(prs, org, repo);

    const completion = await client.chat.completions.create({
        model: config.GROQ_MODEL,
        max_completion_tokens: 1024,
        messages: [{
            role: "user", content: prompt
        }]
    });

    const content = completion.choices[0]?.message?.content?.trim() ?? "";

    if (!content) throw new Error("Groq returned an empty response");


    return {
        content,
        prCount: prs.length,
        mergedCount: prs.filter((p) => p.status === "merged").length,
        inputTokens: completion.usage?.prompt_tokens ?? 0,
        outputTokens: completion.usage?.completion_tokens ?? 0,
        generatedAt: new Date().toISOString(),
        provider: "groq",
    };
}
