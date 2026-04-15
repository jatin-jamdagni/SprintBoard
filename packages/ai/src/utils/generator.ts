import { PullRequestRow } from "@repo/types";
import { config } from "@repo/config";
import { generateStandupSummaryWithGroq } from "../groqai/summarizer";
import { generateStandupSummaryWithAnthropic } from "../anthropic/summarizer";
import { AIProvider, SummaryResult } from "../types";
import { createAnthropicClient } from "../anthropic/client";
import { createGroqClient } from "../groqai/client";

export async function generateStandupSummary(
    prs: PullRequestRow[],
    org: string,
    repo: string,
    options?: GenerateStandupSummaryOptions
): Promise<SummaryResult> {
    const provider = options?.provider ?? config.AI_PROVIDER;

    if (provider === "groq") {
        return generateStandupSummaryWithGroq(prs, org, repo);
    }

    return generateStandupSummaryWithAnthropic(prs, org, repo);
}


export type GenerateStandupSummaryOptions = {
    provider?: AIProvider;
};

export const createAIClient = (
    options?: GenerateStandupSummaryOptions
) => {
    const provider = options?.provider ?? config.AI_PROVIDER;
    if (provider === "groq") {
        return createGroqClient()
    }
    return createAnthropicClient()
}

