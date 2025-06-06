package services

import (
	"fmt"
	"strconv"

	"github.com/csehviktor/watch-together/util"
)

type Room struct {
	Code    string
	Clients map[*client]bool
	Video   *video
	Join    chan *client
	Leave   chan *client
	forward chan *message
}

func NewRoom(code string) *Room {
	newRoom := &Room{
		Code:    code,
		Clients: make(map[*client]bool),
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
		r.broadcastMessage(newMessage(messageVideo, nil, r.Video))
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
	case messageUnpause:
		r.unpauseVideo()
	case messagePause:
		r.pauseVideo()
	case messagePlay:
		if util.IsYoutubeVideo(msg.Data) {
			r.playVideo(msg.Data)
		}
	case messageSeek:
		timestamp, err := strconv.Atoi(msg.Data)
		if err != nil {
			break
		}
		r.seekTo(timestamp)
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

func (r *Room) withVideo(fn func(*video)) {
	if r.Video != nil {
		fn(r.Video)
	}
}

func (r *Room) pauseVideo() {
	r.withVideo((*video).pauseVideo)
}

func (r *Room) unpauseVideo() {
	r.withVideo((*video).unpauseVideo)
}

func (r *Room) seekTo(timestamp int) {
	r.withVideo(func(v *video) {
		v.seekTo(timestamp)
	})
}
