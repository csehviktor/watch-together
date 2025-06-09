package routes

import (
	"errors"

	m "github.com/csehviktor/watch-together/manager"
	"github.com/csehviktor/watch-together/services"
	"golang.org/x/net/websocket"
)

var manager = m.Instance()

func receiveClientInfo(ws *websocket.Conn) (*services.ReceiveClient, error) {
	var receiveClient *services.ReceiveClient

	if err := websocket.JSON.Receive(ws, &receiveClient); err != nil {
		return nil, err
	}
	if receiveClient.Username == "" {
		return nil, errors.New("username is missing")
	}

	return receiveClient, nil
}
