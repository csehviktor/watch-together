package manager

import (
	"log"

	"github.com/csehviktor/watch-together/services"
)

type manager struct {
	rooms map[*services.Room]bool
}

var instance *manager = nil

func Instance() *manager {
	if instance == nil {
		instance = &manager{rooms: make(map[*services.Room]bool)}
	}
	return instance
}

func (m *manager) AddRoom(room *services.Room) {
	m.rooms[room] = true
	log.Printf("created room: %s", room.Code)
}

func (m *manager) AttemptRemoveRoom(room *services.Room) {
	if len(room.Clients)-1 > 0 {
		return
	}
	delete(m.rooms, room)
	log.Printf("deleted room: %s", room.Code)
}

func (m *manager) GetRoomByCode(code string) *services.Room {
	for room := range m.rooms {
		if room.Code == code {
			return room
		}
	}

	return nil
}
