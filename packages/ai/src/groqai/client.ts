import { config } from "@repo/config";
import Groq from "groq-sdk";

export function createGroqClient() {
    if (!config.GROQ_API_KEY) {
        throw new Error("GROQ_API_KEY is not set");
    }

    return new Groq({ apiKey: config.GROQ_API_KEY });

}

export type GroqClient = ReturnType<typeof createGroqClient>;
