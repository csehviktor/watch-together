package routes

import (
	"github.com/csehviktor/watch-together/services"
	"golang.org/x/net/websocket"
)

func HandleJoinRoom(ws *websocket.Conn) {
	defer ws.Close()

	receiveClient, err := receiveCredentials(ws)
	if err != nil {
		ws.Write(services.NewErrorMessage(err.Error()).Encode())
		return
	}

	code := ws.Request().PathValue("code")

	room := manager.GetRoomByCode(code)

	if room == nil {
		ws.Write(services.NewErrorMessage("room was not found").Encode())
		return
	}

	if _, exists := room.Clients[receiveClient.Username]; exists || len(room.Clients) >= room.Settings.MaxClients {
		ws.Write(services.NewErrorMessage("connecting to room was unsuccessful").Encode())
		return
	}

	client := services.NewClient(receiveClient, room, ws)

	client.Join(room)
	defer client.Leave(room)

	go client.WriteLoop()
	client.ReadLoop()
}
