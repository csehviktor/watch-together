package routes

import (
	"errors"

	"github.com/csehviktor/watch-together/services"
	"golang.org/x/net/websocket"
)

func HandleCreateRoom(ws *websocket.Conn) {
	defer ws.Close()

	// first received message should be room settings
	roomSettings, err := receiveRoomSettings(ws)
	if err != nil {
		ws.Write(services.NewErrorMessage(err.Error()).Encode())
		return
	}

	// second received message should be user credentials
	if _, err := receiveCredentials(ws); err != nil {
		ws.Write(services.NewErrorMessage(err.Error()).Encode())
		return
	}

	room := manager.CreateRoom(roomSettings)
	ws.Write([]byte(room.Code))

	go room.Run()
}

func receiveRoomSettings(ws *websocket.Conn) (*services.RoomSettings, error) {
	var roomSettings *services.RoomSettings

	if err := websocket.JSON.Receive(ws, &roomSettings); err != nil {
		ws.Write(services.NewErrorMessage(err.Error()).Encode())
		return nil, err
	}

	if roomSettings == nil || roomSettings.MaxClients < 2 || roomSettings.MaxClients > 20 {
		return nil, errors.New("invalid room settings")
	}

	return roomSettings, nil
}
