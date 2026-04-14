import { ApiResponse } from "@repo/types";






const BASE_URL = typeof window !== "undefined" ? "" : "http://localhost:3000";

export class ApiError extends Error {
    constructor(
        public status: number,
        message: string
    ) {
        super(message);
        this.name = "ApiError"
    }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {

    const res = await fetch(`${BASE_URL}${path}`, {
        ...init,
        headers: {
            "Content-Type": "application/json",
            ...init?.headers
        }
    });

    const json: ApiResponse<T> = await res.json();

    if (!json.success) {
        throw new ApiError(res.status, json.error ?? "Unknown error");
    }

    return json.data
}

