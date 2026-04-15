import { Elysia } from "elysia";
import { config } from "@repo/config";
import { verifyGitHubSignature } from "../lib/webhook-verify";
import { handlePREvent, handleReviewEvent } from "../services/webhook.service";
import type { GitHubPRPayload, GitHubReviewPayload } from "../lib/webhook-types";

export const webhookRoutes = new Elysia({ prefix: "/api/webhooks" })
  .post("/github", async ({ request, set }) => {
    const rawBody = await request.text();
    const event   = request.headers.get("x-github-event");
    const sig     = request.headers.get("x-hub-signature-256");
    const delivery = request.headers.get("x-github-delivery") ?? "unknown";

    console.log(`[webhook] delivery=${delivery} event=${event}`);

    if (config.GITHUB_WEBHOOK_SECRET) {
      const valid = verifyGitHubSignature(config.GITHUB_WEBHOOK_SECRET, rawBody, sig);
      if (!valid) {
        console.warn(`[webhook] invalid signature delivery=${delivery}`);
        set.status= 401;
        return  { success: false, error: "Invalid signature" }
      }
    }

    let payload: unknown;
    try {
      payload = JSON.parse(rawBody);
    } catch {
        set.status = 400;
      return  { success: false, error: "Invalid JSON" }
    }

    try {
      if (event === "pull_request") {
        await handlePREvent(payload as GitHubPRPayload);
      } else if (event === "pull_request_review") {
        await handleReviewEvent(payload as GitHubReviewPayload);
      } else {
        console.log(`[webhook] ignored event=${event}`);
      }
    } catch (err) {
      console.error(`[webhook] handler error event=${event}`, err);
    }

    return { success: true, data: { received: true } };
  });