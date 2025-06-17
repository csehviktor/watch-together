import { useParams, useNavigate } from "react-router"
import { useEffect, useState } from "react"
import { closeConnection, initializeConnection, type ConnectionStatus } from "@/websocket"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import { VideoPlayer } from "@/components/VideoPlayer"
import { RoomChat } from "@/components/RoomChat"
import { RoomClients } from "@/components/RoomClients"
import { RoomHeader } from "@/components/RoomHeader"

export default function RoomPage() {
    const { client } = useLocalStorage()
    const { code } = useParams()
    const navigate = useNavigate()

    const [connection, setConnection] = useState<ConnectionStatus>("connecting")

    useEffect(() => {
        initializeConnection(`/joinroom/${code}/`, {
            onConnected: () => setConnection("connected"),
            onError: () => setConnection("error"),
            onDisconnected: () => {
                setConnection("disconnected")
                navigate("/")
            }
        }, client)

        return () => closeConnection()
    }, [client, code, navigate])

    return(
        <div>
            <RoomHeader code={code!} connection={connection} />

            <main className="w-full px-4 sm:px-6 py-6">
                <div className="grid xl:grid-cols-4 gap-6">
                    <div className="xl:col-span-3 space-y-4">
                        <VideoPlayer />
                        <RoomClients />
                    </div>
                    <div className="xl:col-span-1">
                        <RoomChat />
                    </div>
                </div>
            </main>
        </div>
    )
}
