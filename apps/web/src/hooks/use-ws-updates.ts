import { config } from "@repo/config";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";
import type { WSMessage } from "@repo/types";




const WS_URL = (workspaceId: number) => {
    return `ws://localhost:3000/ws?workspaceId=${workspaceId}`
}

const RECONNECT_DELAY_WS = 3_000;
const MAX_RECONNECT_ATTEMPTS = 10;
const PING_INTERVAL_MS = 30_000;


export function useWSUpdates(workspaceId: number) {
    const qc = useQueryClient();

    const wsRef = useRef<WebSocket | null>(null);


    const reconnectCount = useRef(0);

    const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pingTimer = useRef<ReturnType<typeof setInterval> | null>(null);

    const isMounted = useRef(true);

    const cleatTimers = useCallback(() => {
        if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
        if (pingTimer.current) clearInterval(pingTimer.current);
    }, [])

    const connect = useCallback(() => {

        if (!isMounted.current) return;
        if (wsRef.current?.readyState === WebSocket.OPEN) return;


        const ws = new WebSocket(WS_URL(workspaceId));

        wsRef.current = ws;

        ws.onopen = () => {
            console.log("[ws] connected");
            reconnectCount.current = 0;

            pingTimer.current = setInterval(() => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({ type: "ping", ts: Date.now() }))
                }
            }, PING_INTERVAL_MS)
        };

        ws.onmessage = (event) => {
            let msg: WSMessage;

            try {
                msg = JSON.parse(event.data as string) as WSMessage;

            } catch {
                return;
            }


            switch (msg.type) {
                case "pr.upserted":
                case "pr.synced":
                    qc.invalidateQueries({ queryKey: ["prs", msg.workspaceId] });
                    qc.invalidateQueries({ queryKey: ["snapshots", msg.workspaceId] });
                    break;

                case "summary.generated":
                    qc.invalidateQueries({ queryKey: ["summary-latest", msg.workspaceId] });
                    break;

                case "ping":
                    break;
            }
        }

        ws.onerror = (e) => {
            console.warn("[ws] error", e);
        }

        ws.onclose = () => {
            clearInterval(pingTimer.current!);
            if (!isMounted.current) return;

            if (reconnectCount.current < MAX_RECONNECT_ATTEMPTS) {
                const delay = RECONNECT_DELAY_WS * Math.min(reconnectCount.current + 1, 4);

                console.log(`[ws] reconnecting in ${delay}ms (attempt ${reconnectCount.current + 1})`);

                reconnectCount.current++;

                reconnectTimer.current = setTimeout(connect, delay);
            } else {
                console.warn("[ws] max reconnect attempts reached");
            }
        }

    }, [workspaceId, qc, cleatTimers]);

    useEffect(() => {

        isMounted.current = false;
        cleatTimers();
        wsRef.current?.close()
    }, [connect, cleatTimers])
}