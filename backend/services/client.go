package services

import (
	"io"

	"golang.org/x/net/websocket"
)

type Credentials struct {
	Username string  `json:"username"`
	Avatar   *string `json:"avatar"`
}

type client struct {
	*Credentials
	connection *websocket.Conn
	room       *Room
	receive    chan *message
}

func NewClient(credentials *Credentials, room *Room, ws *websocket.Conn) *client {
	newClient := &client{
		Credentials: credentials,
		connection:  ws,
		room:        room,
		receive:     make(chan *message),
	}

	return newClient
}

func (c *client) Join(room *Room) {
	room.join <- c
}

func (c *client) Leave(room *Room) {
	room.leave <- c
}

func (c *client) ReadLoop() {
	defer c.connection.Close()

	for {
		var receivedMessage *receiveMessage

		if err := websocket.JSON.Receive(c.connection, &receivedMessage); err != nil {
			if err == io.EOF {
				return
			}
			c.connection.Write(NewErrorMessage("error reading message").Encode())
			continue
		}
		message := newMessage(receivedMessage.Type, c, receivedMessage.Data)

		c.room.forward <- message
	}
}

func (c *client) WriteLoop() {
	defer c.connection.Close()

	for msg := range c.receive {
		if err := websocket.JSON.Send(c.connection, msg); err != nil {
			c.connection.Write(NewErrorMessage("error writing message").Encode())
			continue
		}
	}
}
