package routes

import (
	"errors"

	m "github.com/csehviktor/watch-together/manager"
	"github.com/csehviktor/watch-together/services"
	"golang.org/x/net/websocket"
)

var manager = m.Instance()

func receiveCredentials(ws *websocket.Conn) (*services.Credentials, error) {
	var credentials *services.Credentials

	if err := websocket.JSON.Receive(ws, &credentials); err != nil {
		return nil, err
	}
	if credentials.Username == "" {
		return nil, errors.New("username is missing")
	}

	return credentials, nil
}

func receiveRoomSettings(ws *websocket.Conn) (*services.RoomSettings, error) {
	var roomSettings *services.RoomSettings

	if err := websocket.JSON.Receive(ws, &roomSettings); err != nil {
		return nil, err
	}

	if roomSettings == nil || roomSettings.MaxClients < 2 || roomSettings.MaxClients > 20 {
		return nil, errors.New("invalid room settings")
	}

	return roomSettings, nil
}
