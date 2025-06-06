"use client"

import { type Video, sendWebsocketMessage } from "../handler"
import { useRef, useState } from "react"
import { useWebsocket } from "../hook/useWebsocket"
import ReactPlayer from "react-player"

export default function VideoPlayer() {
    const lastSeekRef = useRef<number>(0);
    const playerRef = useRef<HTMLVideoElement | null>(null);
    const [currentVideo, setCurrentVideo] = useState<Video | null>(null)

    useWebsocket({
        video: ({ video }: { video: Video }) => {
            if(lastSeekRef.current !== video.timestamp && playerRef.current) {
                playerRef.current.currentTime = video.timestamp
            }
            setCurrentVideo(video)
        }
    })

    function handleReady() {
        lastSeekRef.current = currentVideo?.timestamp ?? 0
    }

    function handleUnpause() {
        sendWebsocketMessage("unpause")
    }

    function handlePause() {
        sendWebsocketMessage("pause")
    }

    function handleSeek() {
        const timestamp = Math.round(playerRef.current?.currentTime ?? 0)

        sendWebsocketMessage("seek", timestamp.toString())
        lastSeekRef.current = timestamp
    }

    return(
        <div className="relative h-96 lg:h-[700px] w-full shadow-lg overflow-hidden bg-background/10 flex items-center justify-center">
            {
                currentVideo === null 
                ? <p>no video yet</p>
                : (<ReactPlayer
                    ref={playerRef}
                    src={currentVideo?.url}
                    controls
                    style={{ width: "100%", height: "100%" }}
                    playing={currentVideo?.state === "playing"}
                    onReady={handleReady}
                    onPlay={handleUnpause}
                    onPause={handlePause}
                    onSeeked={(_) => handleSeek()}
                />
                )
            }
        </div>
    )
}