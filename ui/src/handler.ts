import { atom } from "nanostores"

export type WebsocketMessage = {
    type: string
    data: string
    sender: {
        username: string
    } | null,
    timestamp: string
}

export type Video = {
    url: string,
    state: string,
    timestamp: number
}

export type Room = {
    connection: WebSocket
    video: Video | null
}

export const room = atom<Room | null>(null)

type ConnectionCallbacks = {
    onConnected?: () => void
    onCodeReceived?: (code: string) => void
    onError?: (error: string) => void
    //onDisconnected?: () => void
}

export function initializeConnection(url: string, callbacks: ConnectionCallbacks) {
    if(room.get()) return

    const ws = new WebSocket(url)
    
    ws.onopen = () => {
        room.set({
            connection: ws,
            video: null
        })
    }

    ws.onmessage = (e: MessageEvent) => {
        const messageData = e.data;

        try {
            if(typeof messageData === "string" && messageData.length === 7) {
                callbacks.onCodeReceived?.(e.data)
                return
            }

            const parsedMessage: WebsocketMessage = JSON.parse(messageData)

            if(parsedMessage.type === "error") {
                callbacks.onError?.(parsedMessage.data)
            } else {
                callbacks.onConnected?.()
            }
        } catch {
            // ignored
        }
    }

    ws.onclose = () => {
        room.set(null)
    }
    
    return () => ws.close()
}

export function sendWebsocketMessage(type: string, data?: string): void {
    const currRoom = room.get()

    if (!currRoom || currRoom.connection.readyState !== WebSocket.OPEN) {
        return
    }

    currRoom.connection.send(JSON.stringify({ type, data } as WebsocketMessage));
}