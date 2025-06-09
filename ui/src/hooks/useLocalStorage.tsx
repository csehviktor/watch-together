"use client"

import { useEffect, useState } from "react"
import { WebsocketClient } from "../websocket"

export function useLocalStorage() {
    const [client, setClient] = useState<WebsocketClient | null>(null)
    
    useEffect(() => {
        let username = localStorage.getItem("username") 
        let avatar = localStorage.getItem("avatar")
    
        if(!username) {
            username = `guest#${Math.floor(1000 + Math.random() * 9000)}`
            localStorage.setItem("username", username)
        }
    
        setClient({ username: username, avatar: avatar } as WebsocketClient)
    }, [])

    return { client, setClient }
}