import { WSMessage } from "@repo/types";
import { logger } from "@repo/logger";

const log = logger.child({ module: "ws" });

type WSClient = {
    id: string;
    workspaceId: number;
    send: (message: string) => void;
    readyState: number;
}

class WSBroker {
    private rooms = new Map<number, Set<WSClient>>();
    private clients = new Map<string, WSClient>();

    register(client: WSClient): void {
        this.clients.set(client.id, client);

        const room = this.rooms.get(client.workspaceId) ?? new Set();

        room.add(client);

        this.rooms.set(client.workspaceId, room);

        log.info(
            { clientId: client.id, workspaceId: client.workspaceId, total: this.clients.size },
            "client connected"
        );
    }


    unregister(clientId: string): void {
        const client = this.clients.get(clientId);

        if (!client) return;

        this.clients.delete(clientId);

        const room = this.rooms.get(client.workspaceId);
        if (room) {
            room.delete(client);
            if (room.size === 0) this.rooms.delete(client.workspaceId);
        }

        log.info({ clientId, total: this.clients.size }, "client disconnected");
    }

    broadcast(workspaceId: number, message: WSMessage): void {
        const room = this.rooms.get(workspaceId);

        if (!room || room.size === 0) return;

        const payload = JSON.stringify(message);

        let sent = 0;
        const stale: string[] = [];

        room.forEach((client) => {
            if (client.readyState === 1) {

                try {
                    client.send(payload);
                    sent++;

                } catch {
                    stale.push(client.id);
                }
            } else {
                stale.push(client.id)
            }
        });

        stale.forEach((id) => this.unregister(id));

        if (sent > 0) {
            log.info({ type: message.type, workspaceId, clients: sent }, "broadcast");
        }

    }


    broadcastAll(message: WSMessage): void {
        Array.from(this.rooms.keys()).forEach((workspacedId) => {
            this.broadcast(workspacedId, message);
        });
    }

    stats() {
        return {
            totalClients: this.clients.size,
            rooms: Object.fromEntries(
                Array.from(this.rooms.entries()).map(([id, set]) => [id, set.size])
            )
        }
    }
}


export const wsBroker = new WSBroker()
