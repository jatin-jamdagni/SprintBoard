
import { z } from "zod";

const optionalSecret = z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().min(1).optional()
);

export const serverConfigSchema = z.object({
    NODE_ENV: z
        .enum(["development", "production", "test"])
        .default("development"),

    // server
    API_PORT: z.coerce.number().default(3000),
    WEB_PORT: z.coerce.number().default(5173),
    API_CORS_ORIGIN: z.string().default("http://localhost:5173"),

    // database
    DATABASE_URL: z.url("DATABASE_URL must be a valid postgres URL"),

    // github
    GITHUB_TOKEN: z.string().min(1, "GITHUB_TOKEN is required"),
    GITHUB_ORG: z.string().min(1, "GITHUB_ORG is required"),
    GITHUB_REPO: z.string().min(1, "GITHUB_REPO is required"),
    GITHUB_POLL_INTERVAL_MS: z.coerce.number().default(5 * 60 * 1000),

    // anthropic
    ANTHROPIC_API_KEY: optionalSecret,
    ANTHROPIC_MODEL: z.string().default("claude-sonnet-4-20250514"),

    GROQ_API_KEY: optionalSecret,
    GROQ_MODEL: z.string().default("openai/gpt-oss-20b"),
    AI_PROVIDER: z.enum(["anthropic", "groq"]).default("groq"),

    // redis (optional until Day 9)
    REDIS_URL: z.string().optional(),

})

export type ServerConfig = z.infer<typeof serverConfigSchema>;
