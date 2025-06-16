package services

import (
	"encoding/json"
	"errors"
	"fmt"
	"math/rand/v2"
	"reflect"
	"strconv"
	"time"
)

type RoomSettings struct {
	MaxClients int `json:"max_clients"`
}

type Room struct {
	Clients      map[*client]bool `json:"-"`
	Code         string           `json:"-"`
	Admin        *client          `json:"admin"`
	Video        *video           `json:"video"`
	Settings     *RoomSettings    `json:"settings"`
	LastActivity time.Time        `json:"-"`
	join         chan *client
	leave        chan *client
	forward      chan *message
	close        chan struct{}
}

func NewRoom(code string, settings *RoomSettings) *Room {
	newRoom := &Room{
		Clients:      make(map[*client]bool),
		Code:         code,
		Admin:        nil,
		Video:        nil,
		Settings:     settings,
		LastActivity: time.Now(),
		join:         make(chan *client),
		leave:        make(chan *client),
		forward:      make(chan *message),
		close:        make(chan struct{}),
	}

	return newRoom
}

func (r *Room) Run() {
	for {
		select {
		case <-r.close:
			return
		case client := <-r.join:
			r.joinClient(client)
		case client := <-r.leave:
			r.leaveClient(client)
		case message := <-r.forward:
			r.handleMessage(message)
		}
		r.LastActivity = time.Now()

		// broadcast room state on every interaction
		r.broadcastMessage(newMessage(messageRoomState, nil, r))
	}
}

func (r *Room) GetClientByUsername(username string) *client {
	for client := range r.Clients {
		if client.Username == username {
			return client
		}
	}
	return nil
}

func (r *Room) Close() {
	for client := range r.Clients {
		r.leaveClient(client)
	}
	close(r.close)
}

func (r *Room) handleMessage(message *message) {
	if message.Admin && message.Sender != r.Admin {
		message.Sender.receive <- NewErrorMessage("no permission")
		return
	}

	switch message.Type {
	case messageKick:
		target := r.GetClientByUsername(message.Data)
		if target == nil {
			message.Sender.receive <- NewErrorMessage("client not found")
			return
		}
		r.leaveClient(target)
	case messagePlay:
		if err := r.playVideo(message.Data); err != nil {
			message.Sender.receive <- NewErrorMessage(err.Error())
		}
	case messageUnpause:
		r.unpauseVideo()
	case messagePause:
		r.pauseVideo()
	case messageSeek:
		r.seekTo(message.Data)
	case messageChat:
		r.broadcastMessage(message)
	}
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
	c.connection.Close()
	r.broadcastRawMessage("client (%s) left the room", c.Username)

	// random client gets to be admin if admin leaves
	if r.Admin == c && len(r.Clients) > 0 {
		r.Admin = reflect.ValueOf(r.Clients).MapKeys()[rand.IntN(len(r.Clients))].Interface().(*client)
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

func (r *Room) playVideo(url string) error {
	video := newVideo(url)
	if video == nil {
		return errors.New("invalid video")
	}

	r.Video = video
	return nil
}

func (r *Room) pauseVideo() {
	if r.Video != nil {
		r.Video.pauseVideo()
	}
}

func (r *Room) unpauseVideo() {
	if r.Video != nil {
		r.Video.unpauseVideo()
	}
}

func (r *Room) seekTo(data string) {
	timestamp, err := strconv.Atoi(data)
	if err != nil || r.Video == nil {
		return
	}
	r.Video.seekTo(timestamp)
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
