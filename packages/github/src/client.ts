import { Octokit } from "@octokit/rest";
import { throttling } from "@octokit/plugin-throttling";

 
export type GitHubClientOptions = {
    token: string;
};

const MyOctokit = Octokit.plugin(throttling);

// GitHub client (singleton factory)
export function createGitHubClient(options: GitHubClientOptions): Octokit {
    return new MyOctokit({
        auth: options.token,
        userAgent: "sprintboard/1.0.0",
        throttle: {
            onRateLimit: (retryAfter, options) => {
                console.warn(
                    `[github] Rate limit hit for ${options.method} ${options.url}. Retrying after ${retryAfter}s`
                );
                return true;
            },
            onSecondaryRateLimit: (_, options) => {
                console.warn(
                    `[github] Secondary rate limit for ${options.method} ${options.url}`
                );
            },
        },
    });
}

export type GitHubClient = ReturnType<typeof createGitHubClient>;

