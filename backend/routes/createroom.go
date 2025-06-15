package routes

import (
	"github.com/csehviktor/watch-together/services"
	"golang.org/x/net/websocket"
)

func HandleCreateRoom(ws *websocket.Conn) {
	defer ws.Close()

	if _, err := receiveClientInfo(ws); err != nil {
		ws.Write(services.NewErrorMessage(err.Error()).Encode())
		return
	}

	room := manager.CreateRoom()
	ws.Write([]byte(room.Code))

	go room.Run()
}
