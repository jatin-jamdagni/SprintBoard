import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

export const Route = createRootRoute({
    component: Root,
});

function Root() {
    return (
        <>
            <div style={{ fontFamily: "system-ui, sans-serif", minHeight: "100vh", background: "#f9fafb" }}>
                <nav style={{
                    padding: "0 24px",
                    height: 56,
                    borderBottom: "1px solid #e5e7eb",
                    background: "#fff",
                    display: "flex",
                    alignItems: "center",
                    gap: 24,
                }}>
                    <span style={{ fontWeight: 700, fontSize: 16, color: "#111" }}>
                        ⚡ SprintBoard
                    </span>
                    <Link
                        to="/"
                        style={{ fontSize: 14, color: "#6b7280", textDecoration: "none" }}
                        activeProps={{ style: { fontSize: 14, color: "#6366f1", fontWeight: 600, textDecoration: "none" } }}
                    >
                        Dashboard
                    </Link>
                </nav>
                <main style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
                    <Outlet />
                </main>
            </div>
            <TanStackRouterDevtools />
        </>

    );
}