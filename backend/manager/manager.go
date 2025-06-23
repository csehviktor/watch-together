package manager

import (
	"log"
	"sync"
	"time"

	"github.com/csehviktor/watch-together/services"
	"github.com/csehviktor/watch-together/util"
)

type manager struct {
	rooms map[string]*services.Room
}

var (
	instance *manager
	once     sync.Once
)

func Instance() *manager {
	once.Do(func() {
		instance = &manager{rooms: make(map[string]*services.Room)}
	})
	return instance
}

func CleanupInactiveRooms() {
	ticker := time.NewTicker(3 * time.Minute)
	defer ticker.Stop()

	for range ticker.C {
		Instance().removeInactiveRooms()
	}
}

func (m *manager) CreateRoom(roomSettings *services.RoomSettings) *services.Room {
	code := util.GenerateRoomCode()
	room := services.NewRoom(code, roomSettings)

	m.rooms[code] = room
	log.Printf("created room: %s", code)

	return room
}

func (m *manager) removeInactiveRooms() {
	for code, room := range m.rooms {
		if len(room.Clients) == 0 && time.Since(room.LastActivity) >= 3*time.Minute {
			delete(m.rooms, code)
			room.Close()
			log.Printf("deleted room: %s", code)
		}
	}
}

func (m *manager) GetRoomByCode(code string) *services.Room {
	return m.rooms[code]
}
