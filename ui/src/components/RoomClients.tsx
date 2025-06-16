import type { Room,  WebsocketClient } from "@/websocket"
import { useState } from "react"
import { useWebsocket } from "@/hooks/useWebsocket"
import { Crown, Users } from "lucide-react"
import { Avatar } from "@/components/Avatar"

export function RoomClients() {
    const [roomState, setRoomState] = useState<Room | null>(null)

    useWebsocket({
        room: ({ room } : { room: Room }) => {
            setRoomState(room)
        }
    })

    return(
        <div className="bg-gray-800/10 backdrop-blur-sm border border-gray-700/30 rounded-xl p-4">
            <h3 className="text-secondary font-medium mb-3 flex items-center">
                <Users className="w-4 h-4 mr-2 text-purple-400" />
                Watching { roomState?.clients?.length ?? 0 } / { roomState?.settings.max_clients ?? 0 }
            </h3>
            <div className="flex flex-wrap gap-2">
                { roomState?.clients?.map((client: WebsocketClient) => (
                    <div key={client.username} className="flex items-center space-x-2 bg-gray-700/40 rounded-lg px-3 py-1.5">
                        <Avatar client={client} width={9} height={9} />
                        <span className="text-md">{client.username}</span>
                        { roomState.admin?.username === client.username && (
                            <Crown className="w-4 h-4 text-yellow-500" />
                        )}
                    </div>
                ))}
            </div>


        </div>
    )
}
