"use client"

import type { WebsocketClient } from "@/websocket"
import { useEffect, useState } from "react"

export function useLocalStorage() {
    const [client, setClient] = useState<WebsocketClient | null>(null)

    useEffect(() => {
        let username = localStorage.getItem("username")
        const avatar = localStorage.getItem("avatar")

        if (!username) {
            username = `guest${Math.floor(1000 + Math.random() * 9000)}`
            localStorage.setItem("username", username)
        }

        setClient({ username, avatar } as WebsocketClient)
    }, [])

    return { client, setClient }
}
