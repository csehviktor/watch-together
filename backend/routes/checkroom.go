package routes

import (
	"net/http"
)

func HandleCheckRoom(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	code := r.PathValue("code")

	room := manager.GetRoomByCode(code)
	if room == nil {
		http.Error(w, "Room not found", http.StatusNotFound)
		return
	}

	w.Write([]byte("Room found"))
}
