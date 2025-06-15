"use client"

import { useStore } from "@nanostores/react"
import { roomStore } from "@/websocket"
import { useEffect, useState } from "react"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MessageHandler = (data: any) => void

export function useWebsocket(handlers: Record<string, MessageHandler>) {
    const $room = useStore(roomStore)
    const [isLoading, setIsLoading] = useState<boolean>(true)

    useEffect(() => {
        if (!$room) return

        setIsLoading(false)

        const handleMessage = (e: MessageEvent) => {
            try {
                const data = JSON.parse(e.data)
                const handler = handlers[data.type]

                if (handler) handler(data)
            } catch {
                // ignored
            }
        }

        $room.connection.addEventListener("message", handleMessage)

        return () => {
            $room.connection.removeEventListener("message", handleMessage)
        }
    }, [$room, handlers])

    return { isLoading }
}
