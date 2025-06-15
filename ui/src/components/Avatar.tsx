import type { WebsocketClient } from "@/websocket"

export function Avatar({ client, width, height }: { client: WebsocketClient | null, width: number, height: number }) {
    return(
        <div
            className="bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center"
            style={{
                backgroundImage: client?.avatar ? `url("${client.avatar }")` : "",
                backgroundSize: "cover",
                backgroundPosition: "center",
                width: width * 4,
                height: height * 4,
            }}
        >
            { !client?.avatar && <span className="text-xs font-semibold text-white"> { client?.username.charAt(0).toUpperCase() }</span> }
        </div>
    )
}
