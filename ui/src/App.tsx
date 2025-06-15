import { Route, Routes } from "react-router"
import HomePage from "@/pages/home"
import RoomPage from "@/pages/room"

export default function App() {
    return(
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/room/:code" element={<RoomPage />} />
        </Routes>
    )
}
