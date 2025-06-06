package routes

import (
	"github.com/csehviktor/watch-together/services"
	"golang.org/x/net/websocket"
)

func HandleJoinRoom(ws *websocket.Conn) {
	defer ws.Close()

	username, err := usernameFromRequest(ws.Request())
	if err != nil {
		ws.Write(services.NewErrorMessage("username is missing or invalid").Encode())
		return
	}

	code := ws.Request().PathValue("code")

	room := manager.GetRoomByCode(code)
	if room == nil || room.ContainsUsername(username) {
		ws.Write(services.NewErrorMessage("connecting to room was unsuccessful").Encode())
		return
	}

	client := services.NewClient(username, room, ws)

	room.Join <- client
	defer func() {
		room.Leave <- client
		manager.AttemptRemoveRoom(room)
	}()

	go client.Write()
	client.Read()
}
