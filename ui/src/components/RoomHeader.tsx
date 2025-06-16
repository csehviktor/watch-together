import type { ConnectionStatus, WebsocketClient } from "@/websocket"
import { useNavigate } from "react-router"
import { useState } from "react"
import { useWebsocket } from "@/hooks/useWebsocket"
import { ArrowLeft, Copy, Loader2, Users, Wifi, WifiOff } from "lucide-react"

export function RoomHeader({ code, connection }: { code: string, connection: ConnectionStatus }) {
    const navigate = useNavigate()
    const [clientsLength, setClientsLength] = useState<number>(0)

    useWebsocket({
        room: ({ room: { clients } } : { room: { clients: Record<string, WebsocketClient> } }) => {
            setClientsLength(Object.keys(clients).length)
        }
    })

    const getConnectionStatusInfo = () => {
        switch (connection) {
            case "connected":
                return {
                    text: "connected",
                    color: "text-green-400",
                    bgColor: "bg-green-400",
                    icon: <Wifi className="w-4 h-4" />
                }
            case "connecting":
                return {
                    text: "connecting",
                    color: "text-yellow-400",
                    bgColor: "bg-yellow-400",
                    icon: <Loader2 className="w-4 h-4 animate-spin" />
                }
            case "disconnected":
            case "error":
                return {
                    text: "disconnected",
                    color: "text-red-400",
                    bgColor: "bg-red-400",
                    icon: <WifiOff className="w-4 h-4" />
                }
            }
        }

    const copyRoomCode = () => {
        navigator.clipboard.writeText(code || "")
    }

    const statusInfo = getConnectionStatusInfo()

    return(
        <header className="px-4 sm:px-6 py-4 border-b border-gray-700/30">
            <div className="w-full flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    { /* back button */}
                    <button onClick={() => navigate("/")} className="p-2 hover:bg-gray-700/40 rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5 text-gray-400 hover:text-white" />
                    </button>

                    { /* room code */}
                    <h1 className="text-xl font-semibold text-secondary">Room</h1>
                    <div className="flex items-center space-x-2 bg-gray-800/20 rounded-lg px-3 py-1.5">
                        <span className="text-purple-400 font-mono text-sm">{code}</span>
                        <button onClick={copyRoomCode} className="p-1 hover:bg-gray-800/60 rounded transition-colors cursor-pointer">
                            <Copy className="w-3 h-3 text-gray-400 hover:text-white" />
                        </button>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    { /* status */}
                    <div className="flex items-center space-x-2 bg-gray-800/20 rounded-lg px-3 py-1.5">
                        <div className="relative">
                            <div className={`w-2 h-2 ${statusInfo.bgColor} rounded-full`}></div>
                            <div className={`absolute inset-0 w-2 h-2 ${statusInfo.bgColor} rounded-full animate-ping opacity-75`}></div>
                        </div>
                        <div className="flex items-center space-x-1 text-xs">
                            <span className={`${statusInfo.color}`}>{statusInfo.icon}</span>
                            <span className={`text-sm font-medium ${statusInfo.color}`}>{statusInfo.text}</span>
                        </div>
                    </div>

                    { /* users count */}
                    <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-400">
                        <Users className="w-4 h-4" />
                        <span>{clientsLength} watching</span>
                    </div>
                </div>
            </div>
        </header>
    )
}
