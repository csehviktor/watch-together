"use client"

import type { Video } from "../handler"
import { useState } from "react"
import { useWebsocket } from "../hook/useWebsocket"

export default function Navbar({ code }: { code: string | undefined }) {
    const [video, setVideo] = useState<Video | null>(null)

    useWebsocket({
        video: ({ video }: { video: Video }) => {
            console.log(video)
            if(video !== undefined)
                setVideo(video)
        }
    })

    return(
        <nav className="flex items-center justify-between mb-7">
            <div className="flex items-center gap-5">
                <div className="bg-box border border-border rounded-lg shadow-lg shadow-box/90 text-xl py-1 px-3">
                    <span>room code: </span>
                    <span className="text-tertiary">{ code }</span>
                </div>

                <div className={`text-md py-2 px-7 ${video?.url !== undefined ? "text-success" : "text-warning"}`}>
                    <span className="font-semibold">currently playing: </span>
                    <span>{ video?.url ?? "nothing" }</span>
                </div>
            </div>
            <a className="buttonLike bg-btn-primary px-4 py-2 cursor-pointer" href="/">leave</a>
        </nav>
    )
}