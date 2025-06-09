package services

import (
	"encoding/json"
	"fmt"
	"strconv"

	"github.com/csehviktor/watch-together/util"
)

type Room struct {
	Clients map[*client]bool `json:"-"`
	Code    string           `json:"-"`
	Admin   *client          `json:"admin"`
	Video   *video           `json:"video"`
	Join    chan *client     `json:"-"`
	Leave   chan *client     `json:"-"`
	forward chan *message
}

func NewRoom(code string) *Room {
	newRoom := &Room{
		Code:    code,
		Clients: make(map[*client]bool),
		Admin:   nil,
		Video:   nil,
		Join:    make(chan *client),
		Leave:   make(chan *client),
		forward: make(chan *message),
	}

	return newRoom
}

func (r *Room) Run() {
	for {
		select {
		case client := <-r.Join:
			r.joinClient(client)
		case client := <-r.Leave:
			r.leaveClient(client)
		case message := <-r.forward:
			r.handleMessage(message)
		}
		// broadcast room state on every interaction
		r.broadcastMessage(newMessage(messageRoomState, nil, r))
	}
}

func (r *Room) ContainsUsername(username string) bool {
	for client := range r.Clients {
		if client.Username == username {
			return true
		}
	}
	return false
}

func (r *Room) joinClient(c *client) {
	// first one to join room gets to be admin
	if len(r.Clients) == 0 {
		r.Admin = c
	}

	r.Clients[c] = true
	r.broadcastRawMessage("client (%s) joined the room", c.Username)
}

func (r *Room) leaveClient(c *client) {
	delete(r.Clients, c)
	r.broadcastRawMessage("client (%s) left the room", c.Username)
}

func (r *Room) handleMessage(msg *message) {
	switch msg.Type {
	case messageChat:
		r.broadcastMessage(msg)
	case messagePlay:
		if util.IsYoutubeVideo(msg.Data) {
			r.playVideo(msg.Data)
		}
	case messageUnpause:
		if r.Video != nil {
			r.Video.unpauseVideo()
		}
	case messagePause:
		if r.Video != nil {
			r.Video.pauseVideo()
		}
	case messageSeek:
		timestamp, err := strconv.Atoi(msg.Data)
		if err != nil || r.Video == nil {
			break
		}
		r.Video.seekTo(timestamp)
	}
}

func (r *Room) broadcastMessage(msg *message) {
	for client := range r.Clients {
		client.receive <- msg
	}
}

func (r *Room) broadcastRawMessage(message string, a ...any) {
	r.broadcastMessage(newMessage(messageChat, nil, fmt.Sprintf(message, a...)))
}

func (r *Room) playVideo(url string) {
	if video := newVideo(url); video != nil {
		r.Video = video
	}
}

func (r *Room) MarshalJSON() ([]byte, error) {
	type Alias Room

	clients := make([]*client, 0, len(r.Clients))

	for client := range r.Clients {
		clients = append(clients, client)
	}

	return json.Marshal(&struct {
		*Alias
		Clients []*client `json:"clients"`
	}{
		Alias:   (*Alias)(r),
		Clients: clients,
	})
}
