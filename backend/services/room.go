package services

import (
	"fmt"
	"math/rand/v2"
	"reflect"
	"strconv"
	"time"
)

type RoomSettings struct {
	MaxClients           int  `json:"max_clients"`
	AdminPlayRestriction bool `json:"admin_play_restriction"`
}

type Room struct {
	Clients      map[string]*client `json:"clients"`
	Code         string             `json:"-"`
	Admin        *client            `json:"admin"`
	Video        *video             `json:"video"`
	Settings     *RoomSettings      `json:"settings"`
	LastActivity time.Time          `json:"-"`
	join         chan *client
	leave        chan *client
	forward      chan *message
	close        chan struct{}
}

func NewRoom(code string, settings *RoomSettings) *Room {
	newRoom := &Room{
		Clients:      make(map[string]*client),
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

func (r *Room) Close() {
	for _, client := range r.Clients {
		r.leaveClient(client)
	}
	close(r.close)
}

func (r *Room) joinClient(c *client) {
	// first one to join room gets to be admin
	if len(r.Clients) == 0 {
		r.Admin = c
	}
	r.Clients[c.Username] = c
	r.broadcastRawMessage("client (%s) joined the room", c.Username)
}

func (r *Room) leaveClient(c *client) {
	delete(r.Clients, c.Username)
	c.connection.Close()
	r.broadcastRawMessage("client (%s) left the room", c.Username)

	// random client gets to be admin if admin leaves
	if r.Admin == c && len(r.Clients) > 0 {
		r.Admin = r.randomClient()
	}
}

func (r *Room) broadcastMessage(msg *message) {
	for _, client := range r.Clients {
		client.receive <- msg
	}
}

func (r *Room) broadcastRawMessage(message string, a ...any) {
	r.broadcastMessage(newMessage(messageChat, nil, fmt.Sprintf(message, a...)))
}

func (r *Room) randomClient() *client {
	keys := reflect.ValueOf(r.Clients).MapKeys()
	randomKey := keys[rand.IntN(len(keys))]

	return reflect.ValueOf(r.Clients).MapIndex(randomKey).Interface().(*client)
}

func (r *Room) handleMessage(msg *message) {
	switch msg.Type {
	case messageKick:
		r.handleKickMessage(msg)
	case messagePlay:
		r.handlePlayMessage(msg)
	case messageUnpause:
		r.handleUnpauseMessage()
	case messagePause:
		r.handlePauseMessage()
	case messageSeek:
		r.handleSeekMessage(msg)
	case messageChat:
		r.broadcastMessage(msg)
	}
}

func (r *Room) handleKickMessage(msg *message) {
	if msg.Sender != r.Admin {
		msg.Sender.receive <- NewErrorMessage("no permission")
		return
	}

	target := r.Clients[msg.Data]
	if target == nil || target == msg.Sender {
		msg.Sender.receive <- NewErrorMessage("can't kick client")
		return
	}
	r.leaveClient(target)
}

func (r *Room) handlePlayMessage(msg *message) {
	if r.Settings.AdminPlayRestriction && msg.Sender != r.Admin {
		msg.Sender.receive <- NewErrorMessage("no permission")
		return
	}

	video := newVideo(msg.Data)
	if video == nil {
		msg.Sender.receive <- NewErrorMessage("invalid video")
		return
	}
	r.Video = video
}

func (r *Room) handleUnpauseMessage() {
	if r.Video != nil {
		r.Video.unpauseVideo()
	}
}

func (r *Room) handlePauseMessage() {
	if r.Video != nil {
		r.Video.pauseVideo()
	}
}

func (r *Room) handleSeekMessage(msg *message) {
	if r.Video == nil {
		return
	}

	timestamp, err := strconv.Atoi(msg.Data)
	if err != nil {
		return
	}
	r.Video.seekTo(timestamp)
}
