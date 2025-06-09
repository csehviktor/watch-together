import { useParams } from "react-router"
import { VideoPlayer } from "../components/VideoPlayer"
import { RoomChat } from "../components/RoomChat"
import { useEffect, useState } from "react"
import { closeConnection, initializeConnection } from "../websocket"
import { RoomHeader, type ConnectionStatus } from "../components/RoomHeader"
import { RoomClients } from "../components/RoomClients"
import { useLocalStorage } from "../hooks/useLocalStorage"

export default function RoomPage() {
    const { code } = useParams()
    const { client } = useLocalStorage()

    const [connection, setConnection] = useState<ConnectionStatus>("connecting")

    useEffect(() => {
        initializeConnection(`${import.meta.env.VITE_WS_ENDPOINT}/joinroom/${code}/`, {
            onConnected: () => setConnection("connected"),
            onError: (_) => {
                setConnection("error")
            }
        }, client)

        return () => closeConnection()
    }, [client])

    return(
        <div>
            <RoomHeader code={code!} connection={connection} />

            <main className="w-full px-4 sm:px-6 py-6">
                <div className="grid xl:grid-cols-4 gap-6">
                    <div className="xl:col-span-3 space-y-4 overflow-hidden">
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