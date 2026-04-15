import type { PullRequestRow } from "@repo/types";

export type AIProvider = "anthropic" | "groq";

export type GenerateSummaryInput = {
  prs: PullRequestRow[];
  org: string;
  repo: string;
};

export type SummaryResult = {
  content: string;
  prCount: number;
  mergedCount: number;
  inputTokens: number;
  outputTokens: number;
  generatedAt: string;
  provider: AIProvider;
};
