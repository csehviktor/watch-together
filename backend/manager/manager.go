package manager

import (
	"log"

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
	if len(room.Clients)-1 > 0 {
		return
	}
	delete(m.rooms, room.Code)
	log.Printf("deleted room: %s", room.Code)
}

func (m *manager) GetRoomByCode(code string) *services.Room {
	return m.rooms[code]
}
