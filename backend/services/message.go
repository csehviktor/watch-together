package services

import (
	"encoding/json"
	"time"
)

type messageType string

const (
	messageChat    messageType = "chat"
	messagePlay    messageType = "play"
	messagePause   messageType = "pause"
	messageUnpause messageType = "unpause"
	messageSeek    messageType = "seek"
	messageError   messageType = "error"
	messageVideo   messageType = "video"
)

type receiveMessage struct {
	Type  messageType `json:"type"`
	Data  string      `json:"data,omitempty"`
	Video *video      `json:"video,omitempty"`
}

type message struct {
	receiveMessage
	Sender    *client   `json:"sender"`
	Timestamp time.Time `json:"timestamp"`
}

func newMessage(msgType messageType, sender *client, data any) *message {
	msg := &message{
		receiveMessage: receiveMessage{
			Type: msgType,
		},
		Sender:    sender,
		Timestamp: time.Now(),
	}

	switch v := data.(type) {
	case string:
		msg.receiveMessage.Data = v
	case *video:
		msg.receiveMessage.Video = v
	default:
		return nil
	}

	return msg
}

func NewErrorMessage(data string) *message {
	return newMessage(messageError, nil, data)
}

func (m *message) Encode() []byte {
	data, _ := json.Marshal(m)

	return data
}
