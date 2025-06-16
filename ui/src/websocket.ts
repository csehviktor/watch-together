import { atom } from "nanostores"

export type WebsocketMessage = {
    type: string
    data: string
    sender: {
        username: string
    } | null,
    timestamp: string
}

export type WebsocketClient = {
    username: string,
    avatar: string | null
}

export type Video = {
    url: string,
    state: string,
    timestamp: number
}

export type RoomSettings = {
    max_clients: number
}

export type Room = {
    settings: RoomSettings,
    admin: WebsocketClient | null,
    video: Video | null
    clients: WebsocketClient[],
}

export type RoomState = {
    connection: WebSocket
    room: Room
}

export const roomStore = atom<RoomState | null>(null)

type ConnectionCallbacks = {
    onConnected?: () => void
    onCodeReceived?: (code: string) => void
    onError?: (error: string) => void
    onDisconnected?: () => void
}

export type ConnectionStatus = "connected" | "connecting" | "error" | "disconnected"

export function initializeConnection(url: string, callbacks: ConnectionCallbacks, client: WebsocketClient | null, roomSettings?: RoomSettings) {
    if(roomStore.get()) return

    if(!client || !client?.username) {
        callbacks.onError?.("client or username is missing")
        return
    }

    const ws = new WebSocket(url)

    ws.onopen = () => {
        roomStore.set({
            connection: ws,
            room: {
                settings: roomSettings ?? { max_clients: 0 },
                admin: null,
                clients: [],
                video: null
            }
        })
        if(roomSettings) ws.send(JSON.stringify(roomSettings))
        ws.send(JSON.stringify(client))

        console.log("websocket connected")
    }

    let hasError = false

    ws.onmessage = (e: MessageEvent) => {
        const messageData = e.data

        console.log(messageData)

        try {
            if(typeof messageData === "string" && messageData.length === 7) {
                callbacks.onCodeReceived?.(e.data)
                return
            }

            const parsedMessage: WebsocketMessage = JSON.parse(messageData)

            if(parsedMessage.type === "error") {
                callbacks.onError?.(parsedMessage.data)
                hasError = true
            } else {
                callbacks.onConnected?.()
            }
        } catch {
            // ignored
        }
    }

    ws.onclose = () => {
        closeConnection()
        if (!hasError) callbacks.onDisconnected?.()
        console.log("websocket disconnected")
    }

    return () => ws.close()
}

export function closeConnection() {
    const room = roomStore.get()

    room?.connection.close()
    roomStore.set(null)
}

export function sendWebsocketMessage(type: string, data?: string): void {
    const currRoom = roomStore.get()

    if (!currRoom || currRoom.connection.readyState !== WebSocket.OPEN) {
        return
    }

    currRoom.connection.send(JSON.stringify({ type, data } as WebsocketMessage))
}
