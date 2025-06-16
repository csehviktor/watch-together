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
