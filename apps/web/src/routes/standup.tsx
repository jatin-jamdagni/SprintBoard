import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/standup")({
  component: Standup,
});

function Standup() {
  return (
    <div>
      <h1
        style={{
          fontSize: 20,
          fontWeight: 600,
          color: "var(--color-text-primary)",
          margin: "0 0 8px",
        }}
      >
        Standup summary
      </h1>
      <p style={{ fontSize: 13, color: "var(--color-text-tertiary)" }}>
        AI-generated standup summaries comming soon...
      </p>
    </div>
  );
}