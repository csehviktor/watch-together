package routes

import (
	"github.com/csehviktor/watch-together/services"
	"golang.org/x/net/websocket"
)

func HandleCreateRoom(ws *websocket.Conn) {
	defer ws.Close()

	roomSettings, err := receiveRoomSettings(ws)
	if err != nil {
		ws.Write(services.NewErrorMessage(err.Error()).Encode())
		return
	}

	if _, err := receiveCredentials(ws); err != nil {
		ws.Write(services.NewErrorMessage(err.Error()).Encode())
		return
	}

	room := manager.CreateRoom(roomSettings)
	ws.Write([]byte(room.Code))

	go room.Run()
}
