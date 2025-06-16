package manager

import (
	"log"
	"time"

	"github.com/csehviktor/watch-together/services"
	"github.com/csehviktor/watch-together/util"
)

type manager struct {
	rooms map[string]*services.Room
}

var instance *manager = nil

func Instance() *manager {
	if instance == nil {
		instance = &manager{rooms: make(map[string]*services.Room)}
	}
	return instance
}

func (m *manager) CreateRoom() *services.Room {
	code := util.GenerateRoomCode()
	room := services.NewRoom(code)

	m.rooms[code] = room
	log.Printf("created room: %s", code)

	return room
}

func (m *manager) AttemptRemoveRoom(room *services.Room) {
	// return if more than 0 users, or last activity was less than 10 minutes ago
	if len(room.Clients)-1 > 0 || time.Since(room.LastActivity) < 10*time.Minute {
		return
	}
	delete(m.rooms, room.Code)
	room.Close()

	log.Printf("deleted room: %s", room.Code)
}

func (m *manager) GetRoomByCode(code string) *services.Room {
	return m.rooms[code]
}
