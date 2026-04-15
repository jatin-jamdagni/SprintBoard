import Anthropic from "@anthropic-ai/sdk";
import { config } from "@repo/config";


export function createAnthropicClient() {
    if (!config.ANTHROPIC_API_KEY) {
        throw new Error("ANTHROPIC_API_KEY is not set");
    }

    return new Anthropic({
        apiKey: config.ANTHROPIC_API_KEY
    })
}

export type AnthropicClient = ReturnType<typeof createAnthropicClient>;
