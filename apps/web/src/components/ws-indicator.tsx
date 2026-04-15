import React, { useEffect, useRef, useState } from 'react'


type Status = "connecting" | "connected" | "disconnected";

const WS_URL = (workspaceId: number) =>
    `ws://localhost:3000/ws?workspaceId=${workspaceId}`;
const WSIndicator = ({ workspaceId }: { workspaceId: number }) => {

    const [status, setStatus] = useState<Status>("connecting");

    const ws = useRef<WebSocket | null>(null);

    useEffect(() => {
        const socket = new WebSocket(WS_URL(workspaceId));
        ws.current = socket;

        socket.onopen = () => setStatus("connected");
        socket.onclose = () => setStatus("disconnected");
        socket.onerror = () => setStatus("disconnected");

        return () => socket.close()

    }, [workspaceId])

    const dot: Record<Status, string> = {
        connecting: "bg-status-warning-dot animate-pulse",
        connected: "bg-status-success-dot",
        disconnected: "bg-text-disabled"
    };

    const label: Record<Status, string> = {
        connecting: "connecting",
        connected: "live",
        disconnected: "offline",
    };

    return (
        <div className="flex items-center gap-1.5">
            <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${dot[status]}`} />
            <span className="text-[11px] text-text-muted">{label[status]}</span>
        </div>
    )
}

export default WSIndicator