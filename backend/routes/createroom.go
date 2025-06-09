package routes

import (
	"github.com/csehviktor/watch-together/services"
	"github.com/csehviktor/watch-together/util"
	"golang.org/x/net/websocket"
)

func HandleCreateRoom(ws *websocket.Conn) {
	defer ws.Close()

	if _, err := receiveClientInfo(ws); err != nil {
		ws.Write(services.NewErrorMessage(err.Error()).Encode())
		return
	}

	room := services.NewRoom(util.GenerateRoomCode())
	manager.AddRoom(room)

	ws.Write([]byte(room.Code))

	go room.Run()
}
