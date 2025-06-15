package routes

import (
	"github.com/csehviktor/watch-together/services"
	"golang.org/x/net/websocket"
)

func HandleJoinRoom(ws *websocket.Conn) {
	defer ws.Close()

	receiveClient, err := receiveClientInfo(ws)
	if err != nil {
		ws.Write(services.NewErrorMessage(err.Error()).Encode())
		return
	}

	code := ws.Request().PathValue("code")

	room := manager.GetRoomByCode(code)
	if room == nil || room.ContainsUsername(receiveClient.Username) {
		ws.Write(services.NewErrorMessage("connecting to room was unsuccessful").Encode())
		return
	}

	client := services.NewClient(receiveClient, room, ws)

	client.Join(room)
	defer func() {
		client.Leave(room)
		manager.AttemptRemoveRoom(room)
	}()

	go client.WriteLoop()
	client.ReadLoop()
}
