import { Elysia, t } from "elysia";
import { wsBroker } from "../lib/ws-broker";
import { WSMessageSchema } from "@repo/types";

let clientCounter = 0;
const connectionMeta = new WeakMap<object, { clientId: string; workspaceId: number }>();

export const wsRoutes = new Elysia()
  .ws("/ws", {
    query: t.Object({
      workspaceId: t.String(),
    }),
    open(ws) {

      const parsedWorkspaceId = Number(ws.data.query.workspaceId)

      const workspaceId = Number.isFinite(parsedWorkspaceId) && parsedWorkspaceId > 0
        ? parsedWorkspaceId : 1;

      const clientId = `client-${++clientCounter}-${Date.now()}`;


      connectionMeta.set(ws.raw, { clientId, workspaceId });

      wsBroker.register({
        id: clientId,
        workspaceId,
        send: (data) => ws.send(data),
        get readyState() {
          return ws.readyState;
        },
      });

      ws.send(JSON.stringify({ type: "ping", ts: Date.now() }));
    },

    close(ws) {

      const meta = connectionMeta.get(ws.raw);

      if (meta) {
        wsBroker.unregister(meta.clientId);
        connectionMeta.delete(ws.raw)
      }
    },

    message(ws, raw) {
      try {
        const msg = WSMessageSchema.safeParse(
          typeof raw === "string" ? JSON.parse(raw) : raw
        );
        if (msg.success && msg.data.type === "ping") {
          ws.send(JSON.stringify({ type: "ping", ts: Date.now() }));
        }
      } catch {
        // ignore malformed messages
      }
    },
  });