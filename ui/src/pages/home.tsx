import { closeConnection, initializeConnection } from "../websocket"
import { useNavigate } from "react-router"
import { useRef, useState } from "react"
import { Play, Users, Camera, Settings, Tv } from "lucide-react"
import { useLocalStorage } from "../hooks/useLocalStorage"
import { Avatar } from "../components/Avatar"

export default function HomePage() {
    const navigate = useNavigate()
    const { client, setClient } = useLocalStorage()

    const fileInputRef = useRef<HTMLInputElement | null>(null) 
    const [roomCode, setRoomCode] = useState<string>("")
    const [showUserMenu, setShowUserMenu] = useState<boolean>(false)

    const handleJoinRoom = () => {
        if(roomCode.trim()) {
            navigate(`/room/${roomCode.trim()}/`)
        }
    }

    const handleCreateRoom = () => {
        initializeConnection(`${import.meta.env.VITE_WS_ENDPOINT}/createroom/`, {
            onCodeReceived: (code) => (navigate(`/room/${code}/`)),
            onError: (error) => alert(error),
        }, client)
        
        return () => closeConnection()
    }

    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]

        if(!file || !file.type.startsWith("image/")) {
            alert("invalid file type")
            return
        }

        if(file.size > 5 * 1024 * 1024) {
            alert("file is too large")
            return
        }

        const reader = new FileReader()
        reader.onload = (e) => setClient(prev => ({ ...prev!, avatar: e.target?.result as string}))
        reader.readAsDataURL(file)
    }
    
    return(
        <div>
            <header className="flex justify-between items-center px-8 py-12">
                {/* logo meg vmi iras */}
                <div className="flex items-center space-x-3 text-secondary">
                    <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/25">
                        <Tv className="w-6 h-6" />
                    </div>
                    <h1 className="text-2xl font-bold ">watch-together</h1>
                </div>

                {/* user menu */}
                <div className="relative">
                    <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex cursor-pointer items-center space-x-3 backdrop-blur-sm border border-slate-700/50 rounded-lg px-4 py-2.5 transition-all duration-200 group">
                        <Avatar client={client} width={8} height={8} />
                        <span className="font-medium hidden sm:block">{client?.username ?? ""}</span>
                        <Settings className="w-4 h-4 text-slate-400 group-hover:text-secondary transition-colors" />
                    </button>

                    { showUserMenu && (
                        <div className="absolute right-0 top-full mt-2 w-64 bg-gray-800/10 backdrop-blur-sm border border-gray-600/40 rounded-lg shadow-xl p-4 z-20 space-y-4">
                            <div>
                                <label htmlFor="username" className="block text-sm font-semibold text-gray-300 mb-2">Username</label>
                                <input 
                                    type="text" 
                                    name="username"
                                    value={client?.username} 
                                    onChange={(e) => setClient(prev => ({ ...prev!, username: e.target.value }))}
                                    className="w-full bg-gray-700/20 border border-gray-600/60 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    placeholder="enter username"
                                    autoComplete="off"
                                />
                            </div>
                            <div>
                                <label htmlFor="avatar" className="block text-sm font-semibold text-gray-300 mb-2">Avatar</label>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    name="avatar"
                                    id="fileInput"
                                    accept="image/"
                                    onChange={handleAvatarUpload}
                                    className="hidden"
                                />
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full flex items-center justify-center space-x-2 bg-gray-700/20 hover:bg-gray-700/30 border border-gray-600/60 rounded-lg px-3 py-2 hover:text-secondary transition-all"
                                >
                                    <Camera className="w-4 h-4" />
                                    <span>Upload</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </header>

            <main className="px-6 py-12 max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-16 lg:gap-28 items-center">
                    {/* left section */}
                    <div className="text-center lg:text-left">
                        <h2 className="text-5xl lg:text-6xl font-bold text-secondary mb-6 leading-tight">
                            Watch
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                                Together
                            </span>
                        </h2>
                        <p className="text-xl mb-8 leading-relaxed">
                            Create or join a room to watch youtube videos and shorts with your friends in perfect sync
                        </p>
                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-sm">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                                <span>Youtube Support</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                <span>Real-time Sync</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                                <span>Room Chat</span>
                            </div>
                        </div>
                    </div>

                    {/* right section */}
                    <div className="space-y-6">

                        {/* join room card */}
                        <div className="bg-gray-800/10 backdrop-blur-sm border border-gray-600/30 rounded-2xl p-8">
                            <h3 className="text-2xl font-semibold text-secondary mb-6 flex items-center">
                                <Users className="w-6 h-6 mr-3 text-purple-400" />
                                Join a Room
                            </h3>
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    value={roomCode}
                                    onChange={(e) => setRoomCode(e.target.value)}
                                    placeholder="enter room code"
                                    className="w-full bg-gray-700/20 border border-gray-600/60 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-lg"
                                    onKeyDown={(e) => e.key === "Enter" && handleJoinRoom()}
                                />
                                <button 
                                    onClick={handleJoinRoom}
                                    disabled={!roomCode.trim() || !client || !client?.username.trim()}
                                    className="cursor-pointer w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-secondary font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2 text-lg shadow-lg shadow-purple-600/25 disabled:shadow-none"
                                >
                                    Join room
                                </button>
                            </div>
                        </div>

                        {/* divider */}
                        <div className="relative flex items-center">
                            <div className="flex-1 border-b border-gray-600/50"></div>
                            <span className="px-4 text-sm font-medium">OR</span>
                            <div className="flex-1 border-b border-gray-600/50"></div>
                        </div>

                        {/* create room card */}
                        <div className="bg-gray-800/10 backdrop-blur-sm border border-gray-600/30 rounded-2xl p-8">
                            <h3 className="text-2xl font-semibold text-secondary mb-6 flex items-center">
                                <Play className="w-6 h-6 mr-3 text-green-400" />
                                Create a Room
                            </h3>
                            <p className="mb-6">Start a new room and invite your friends to watch together</p>
                            <button 
                                onClick={handleCreateRoom}
                                disabled={!client || !client.username.trim()}
                                className="cursor-pointer w-full bg-gradient-to-r disabled:bg-none disabled:bg-gray-600 from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-secondary font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2 text-lg shadow-lg shadow-green-600/25 disabled:shadow-none"
                            >
                                Create room
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            <footer>

            </footer>

            {/* when user clicks outside user menu */}
            {showUserMenu && (
                <div onClick={() => {
                    setShowUserMenu(false)
                    localStorage.setItem("username", client!.username)
                    localStorage.setItem("avatar", client!.avatar!)
                }} 
                className="fixed inset-0 z-10"></div>
            )}
        </div>
    )
}