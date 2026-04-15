export type GitHubPRAction =
  | "opened"
  | "closed"
  | "reopened"
  | "synchronize"
  | "review_requested"
  | "review_request_removed"
  | "labeled"
  | "unlabeled"
  | "edited"
  | "ready_for_review"
  | "converted_to_draft"
  | "auto_merge_enabled"
  | "auto_merge_disabled";

export type GitHubReviewAction = "submitted" | "edited" | "dismissed";

export interface GitHubPRPayload {
  action: GitHubPRAction;
  number: number;
  pull_request: {
    number: number;
    title: string;
    state: string;
    merged: boolean;
    merged_at: string | null;
    draft: boolean;
    html_url: string;
    user: { login: string; avatar_url: string };
    created_at: string;
    additions: number;
    deletions: number;
  };
  repository: {
    name: string;
    full_name: string;
    owner: { login: string };
  };
  installation?: { id: number };
}

export interface GitHubReviewPayload {
  action: GitHubReviewAction;
  review: {
    state: string;
    submitted_at: string;
    user: { login: string };
  };
  pull_request: { number: number };
  repository: {
    full_name: string;
    owner: { login: string };
  };
}