import type { WebsocketClient } from "../websocket"
import { useRef, useState } from "react"
import { useWebsocket } from "../hooks/useWebsocket"
import { Crown, Users } from "lucide-react"

export function RoomClients() {
    const adminRef = useRef<WebsocketClient | null>(null)
    const [currentClients, setCurrentClients] = useState<WebsocketClient[] | null>(null)

    useWebsocket({
        room: ({ room: { admin, clients } } : { room: { admin: WebsocketClient, clients: WebsocketClient[] } }) => {
            if(adminRef.current !== admin) adminRef.current = admin
            if(currentClients?.length !== clients.length) setCurrentClients(clients)
        }
    })

    return(
        <div className="bg-gray-800/10 backdrop-blur-sm border border-gray-700/30 rounded-xl p-4">
            <h3 className="text-secondary font-medium mb-3 flex items-center">
                <Users className="w-4 h-4 mr-2 text-purple-400" />
                Watching ({ currentClients?.length ?? 0 })
            </h3>
            <div className="flex flex-wrap gap-2">
                { currentClients?.map((client: WebsocketClient) => (
                    <div key={client.username} className="flex items-center space-x-2 bg-gray-700/40 rounded-lg px-3 py-1.5">
                        <div 
                            className="h-9 w-9 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center"
                            style={{ 
                                backgroundImage: client.avatar ? `url("${client.avatar }")` : "", 
                                backgroundSize: "cover", 
                                backgroundPosition: "center" 
                            }}    
                        >
                            { !client.avatar && <span className="text-xs font-semibold text-white"> { client.username.charAt(0).toUpperCase() }</span> }
                        </div>
                        <span className="text-md">{client.username}</span>
                        { adminRef.current?.username === client.username && (
                            <Crown className="w-4 h-4 text-yellow-500" />
                        )}
                    </div>
                ))}
            </div>


        </div>
    )
}