import { createFileRoute } from "@tanstack/react-router";
import type { ApiResponse } from "@repo/types";

export const Route = createFileRoute("/")({
  loader: async () => {
    const res = await fetch("/api/health");
    const json: ApiResponse<{ status: string; version: string; uptime: number }> =
      await res.json();
    return json;
  },
  component: Index,
});

function Index() {
  const result = Route.useLoaderData();
  const ok = result.success;

  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 700, margin: "0 0 6px" }}>
        SprintBoard
      </h1>
      <p style={{ color: "#6b7280", margin: "0 0 28px", fontSize: 15 }}>
        Engineering team shipping dashboard
      </p>

      <div style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 18px",
        borderRadius: 10,
        border: `1px solid ${ok ? "#86efac" : "#fca5a5"}`,
        background: ok ? "#f0fdf4" : "#fef2f2",
      }}>
        <span style={{
          width: 8, height: 8, borderRadius: "50%",
          background: ok ? "#22c55e" : "#ef4444",
          display: "inline-block",
        }} />
        <span style={{ fontSize: 14, fontWeight: 500, color: ok ? "#15803d" : "#dc2626" }}>
          {ok ? "API connected" : "API unreachable"}
        </span>
        {ok && result.data && (
          <span style={{ fontSize: 12, color: "#166534" }}>
            v{result.data.version} · uptime {Math.floor(result.data.uptime)}s
          </span>
        )}
      </div>
    </div>
  );
}