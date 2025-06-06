"use client"

import { sendWebsocketMessage, type WebsocketMessage } from "../handler"
import { useState, type FormEvent } from "react"
import { useWebsocket } from "../hook/useWebsocket"

export default function RoomChat() {
    const [messages, setMessages] = useState<WebsocketMessage[]>([]);

    const { isLoading } = useWebsocket({
        chat: (message: WebsocketMessage) => {
            setMessages(prev => [...prev, message])
        }
    })

    function handleMessageSend(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()
        
        const form = e.currentTarget
        const message = new FormData(form).get("message")?.toString().trim()

        if(!message || isLoading) return

        if(message.startsWith("/play")) {
            const url = message.split(" ")[1]
            sendWebsocketMessage("play", url)
        } else {
            sendWebsocketMessage("chat", message)
        }

        form.reset()
    }

    const connectionStatus = isLoading 
        ? "connecting..."
        : "connected to room chat" 
    
    return(
        <div className="h-full w-full rounded-lg bg-box/40 relative text-sm min-h-96">
            <div className="p-2 text-md">
                <p className="mb-3">{ connectionStatus }</p>
                { messages.map(message => (
                    <Message key={message.timestamp} message={message} />) 
                )}
            </div>

            <div className="absolute bottom-0 border-t border-border w-full">
                <form onSubmit={handleMessageSend} className="flex items-center jusitfy-between">
                    <input type="text" name="message" className="p-3 w-full" placeholder="Send a message" autoComplete="off" />
                    <input type="submit" value="send" className="bg-btn-secondary cursor-pointer px-3 py-2 m-2" />
                </form>
            </div>
        </div>
    )
}

function Message({ message }: { message: WebsocketMessage }) {
    if(message.sender === null) {
        return <p className="my-2">{ message.data }</p>
    }
    const usernameHash = Array.from(message.sender.username).reduce(
        (hash, char) => char.charCodeAt(0) + (hash << 6) + (hash << 16) - hash, 0
    )
    const color = `hsl(${Math.abs(usernameHash) % 360}, 70%, 60%)`;   

    return <p><span style={{ color: color }} className="font-semibold">{ message.sender.username }: </span>{ message.data }</p>
}