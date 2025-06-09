"use client"

import { sendWebsocketMessage, type WebsocketMessage } from "../websocket"
import { useEffect, useRef, useState } from "react"
import { useWebsocket } from "../hooks/useWebsocket"
import { Play, Send } from "lucide-react"

type Command = {
    name: string,
    description: string,
    usage: string,
    icon: React.ReactNode,
}

export function RoomChat() {
    const chatInputRef = useRef<HTMLInputElement>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const [chatMessage, setChatMessage] = useState<string>("")
    const [showCommandToolbar, setShowCommandToolbar] = useState(false)
    const [filteredCommands, setFilteredCommands] = useState<Command[]>([])
    const [selectedCommandIndex, setSelectedCommandIndex] = useState(0)

    const [messages, setMessages] = useState<WebsocketMessage[]>([])

    const { isLoading } = useWebsocket({
        chat: (message: WebsocketMessage) => {
            setMessages(prev => [...prev, message])
        },
        error: (message: WebsocketMessage) => {
            setMessages(prev => [...prev, message])
        }
    })

    const commands: Command[] = [
        {
            name: "/play",
            description: "Load and play a video from URL",
            usage: "/play <url>",
            icon: <Play className="w-4 h-4" />
        }
    ]

    const handleChatInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setChatMessage(value)
        setShowCommandToolbar(false)

        if (value.startsWith("/")) {
            const commandText = value.toLowerCase()
            const filtered = commands.filter(cmd => cmd.name.toLowerCase().startsWith(commandText))
      
            if (filtered.length > 0) {
                setFilteredCommands(filtered)
                setShowCommandToolbar(true)
                setSelectedCommandIndex(0)
            }
        }
    }

    const selectCommand = (command: Command) => {
        setChatMessage(command.usage)
        setShowCommandToolbar(false)
        
        setTimeout(() => {
            if (chatInputRef.current) {
                chatInputRef.current.focus()
                chatInputRef.current.setSelectionRange(command.name.length + 1, command.usage.length)
            }
        }, 0)
    }

    const handleChatKeydown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if(showCommandToolbar && filteredCommands.length > 0) {
            switch(e.key) {
                case "ArrowUp":
                    e.preventDefault()
                    setSelectedCommandIndex(prev =>
                        prev > 0 ? prev - 1 : filteredCommands.length - 1
                    )
                    break
                case "ArrowDown":
                    e.preventDefault()
                    setSelectedCommandIndex(prev =>
                        prev < filteredCommands.length - 1 ? prev + 1 : 0
                    )
                    break
                case "Tab":
                case "Enter":
                    e.preventDefault()
                    selectCommand(filteredCommands[selectedCommandIndex])
                    break
                case "Escape":
                    setShowCommandToolbar(false)
                    break
            }
        } else if (e.key === "Enter") {
            handleSendMessage()
        }
    }

    function handleSendMessage() {        
        if(!chatMessage.trim() || isLoading) return

        if(chatMessage.startsWith("/play")) {
            const url = chatMessage.substring(6).trim()

            if(url) {
                sendWebsocketMessage("play", url)
            }
        } else {
            sendWebsocketMessage("chat", chatMessage)
        }        
        
        setChatMessage("")
    }

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => { scrollToBottom() }, [messages])
    
    return(
        <div className="bg-gray-800/10 backdrop-blur-sm border border-gray-700/30 rounded-xl flex flex-col h-full max-h-screen">
            {/* header */}
            <div className="p-4 border-b border-gray-700/30 text-center">
                <h3 className="text-white font-bold">CHAT</h3>
            </div>

            {/* messages */}
            <div className="overflow-y-auto p-4 space-y-2 h-full min-h-96 max-h-[49.5rem]">
                { messages.map(message => (
                    <Message key={message.timestamp} message={message} />) 
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* command toolbar */}
            { showCommandToolbar && filteredCommands.length > 0 && (
                <div className="absolute bottom-16 w-full mb-2 bg-gray-800/10 backdrop-brightness-0 border border-gray-600/60 rounded-lg overflow-hidden">
                    { filteredCommands.map((command, index) => (
                        <div 
                            key={command.name} 
                            className={`p-3 cursor-pointer transiton-colors ${index === selectedCommandIndex ? "bg-purple-600/40" : "hover:bg-purple-600/40"}`}
                            onClick={() => selectCommand(command)}
                        >
                            <div className="flex items-center space-x-3">
                                <div className="text-purple-400">{ command.icon }</div>
                                <div className="flex-1 min-w-0 items-center space-x-2">
                                    <span className="text-secondary font-medium text-sm">{ command.name }</span>
                                    <span className="text-primary/50 font-medium text-sm">{ command.usage }</span>

                                    <p className="text-xs mt-1">{ command.description }</p>
                                </div>
                                
                            </div>
                        </div>  
                    ))}
                    <div className="px-3 py-2 bg-gray-700/20 border-t border-gray-600/40">
                        <p className="text-xs text-gray-400">
                            <kbd className="px-1.5 py-0.5 bg-gray-600/60 rounded text-xs">↑↓</kbd> navigate
                            <kbd className="px-1.5 py-0.5 bg-gray-600/60 rounded text-xs ml-2">Tab</kbd> select
                            <kbd className="px-1.5 py-0.5 bg-gray-600/60 rounded text-xs ml-2">Esc</kbd> close
                        </p>
                    </div>
                </div>
            )}

            {/* send message input */}
            <div className="p-1 border-t border-gray-700/30 h-[4rem]">
                <div className="flex items-center jusitfy-between">
                    <input
                        ref={chatInputRef}
                        type="text" 
                        name="message"
                        value={chatMessage}
                        onChange={handleChatInputChange}
                        onKeyDown={handleChatKeydown}
                        autoComplete="off"
                        placeholder="Type a message or /play <url>..."
                        className="flex-1 py-4 px-2 focus:outline-none"
                    />
                    <button 
                        onClick={handleSendMessage} 
                        disabled={!chatMessage.trim()}
                        className="p-2 m-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 rounded-lg cursor-pointer" 
                    >
                        <Send className="w-4 h-4 text-white" />
                    </button>
                </div>
            </div>
        </div>
    )
}

function Message({ message }: { message: WebsocketMessage }) {
    if (message.type === "error") {
        return <p className="font-medium text-red-300 bg-red-500/30 p-2 rounded-lg">{ message.data }</p>
    }
    
    if(message.sender === null) {
        return <p className="italic">{ message.data }</p>
    }

    const usernameHash = Array.from(message.sender.username).reduce(
        (hash, char) => char.charCodeAt(0) + (hash << 6) + (hash << 16) - hash, 0
    )
    const color = `hsl(${Math.abs(usernameHash) % 360}, 70%, 60%)`

    return (
        <div className="flex items-center justify-between">
            <div className="wrap-anywhere">
                <span className="font-semibold" style={{ color: color }}>{ message.sender.username }: </span>
                <span className="">{ message.data }</span>
            </div>
            <span className="text-xs text-nowrap mx-2">
                { new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
        </div>
    )
}