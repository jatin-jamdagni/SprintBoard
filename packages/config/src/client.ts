export const clientConfig = {
  apiBase: "",
  wsBase:
    typeof window !== "undefined"
      ? `ws://${window.location.host}`
      : "ws://localhost:3000",
} as const;