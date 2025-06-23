package services

import (
	"encoding/json"
	"time"
)

type messageType string

const (
	messageKick      messageType = "kick"
	messageChat      messageType = "chat"
	messagePlay      messageType = "play"
	messagePause     messageType = "pause"
	messageUnpause   messageType = "unpause"
	messageSeek      messageType = "seek"
	messageError     messageType = "error"
	messageRoomState messageType = "room"
)

type receiveMessage struct {
	Type      messageType `json:"type"`
	Data      string      `json:"data,omitempty"`
	RoomState *Room       `json:"room,omitempty"`
}

type message struct {
	receiveMessage
	Sender    *client   `json:"sender"`
	Timestamp time.Time `json:"timestamp"`
}

func newMessage(msgType messageType, sender *client, data any) *message {
	msg := &message{
		receiveMessage: receiveMessage{Type: msgType},
		Sender:         sender,
		Timestamp:      time.Now(),
	}

	switch v := data.(type) {
	case string:
		msg.Data = v
	case *Room:
		msg.RoomState = v
	default:
		return nil
	}

	return msg
}

func NewErrorMessage(data string) *message {
	return &message{
		receiveMessage: receiveMessage{
			Type: messageError,
			Data: data,
		},
		Timestamp: time.Now(),
	}
}

func (m *message) Encode() []byte {
	data, _ := json.Marshal(m)
	return data
}
