import type { WebsocketClient } from "@/websocket"
import { useRef, useState } from "react"
import { useWebsocket } from "@/hooks/useWebsocket"
import { Crown, Users } from "lucide-react"
import { Avatar } from "@/components/Avatar"

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
                        <Avatar client={client} width={9} height={9} />
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
