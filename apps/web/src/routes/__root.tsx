import {
    createRootRoute,
    Link,
    Outlet
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

export const Route = createRootRoute({
    component: Root,
});

function Root() {
    return (
        <>
            <div
                style={{
                    fontFamily: "system-ui, -apple-system, sans-serif",
                    minHeight: "100vh",
                    background: "var(--color-background-tertiary, #f9fafb)",
                }}
            >
                <nav
                    style={{
                        height: 52,
                        borderBottom: "0.5px solid var(--color-border-tertiary)",
                        background: "var(--color-background-primary)",
                        display: "flex",
                        alignItems: "center",
                        gap: 24,
                        padding: "0 24px",
                        position: "sticky",
                        top: 0,
                        zIndex: 10,
                    }}
                >
                    <span style={{ fontWeight: 600, fontSize: 15, color: "var(--color-text-primary)" }}>
                        ⚡ SprintBoard
                    </span>

                    <Link
                        to="/"
                        style={{ fontSize: 13, color: "var(--color-text-secondary)", textDecoration: "none" }}
                        activeProps={{
                            style: {
                                fontSize: 13,
                                color: "var(--color-text-primary)",
                                fontWeight: 500,
                                textDecoration: "none",
                            },
                        }}
                        activeOptions={{ exact: true }}
                    >
                        Dashboard
                    </Link>

                    <Link
                        to="/standup"    
                        style={{ fontSize: 13, color: "var(--color-text-secondary)", textDecoration: "none" }}
                        activeProps={{
                            style: {
                                fontSize: 13,
                                color: "var(--color-text-primary)",
                                fontWeight: 500,
                                textDecoration: "none",
                            },
                        }}
                    >
                        Standup
                    </Link>
                </nav>

                <main
                    style={{
                        maxWidth: 1000,
                        margin: "0 auto",
                        padding: "28px 24px",
                    }}
                >
                    <Outlet />
                </main>
            </div>
            <TanStackRouterDevtools />
        </>

    );
}