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

func DeleteRoomCronjob() {
	manager := Instance()

	ticker := time.NewTicker(3 * time.Minute)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			for _, room := range manager.rooms {
				manager.attemptRemoveRoom(room)
			}
		}
	}
}

func (m *manager) CreateRoom(roomSettings *services.RoomSettings) *services.Room {
	code := util.GenerateRoomCode()
	room := services.NewRoom(code, roomSettings)

	m.rooms[code] = room
	log.Printf("created room: %s", code)

	return room
}

func (m *manager) attemptRemoveRoom(room *services.Room) {
	// return if more than 0 users, or last activity was less than 3 minutes ago
	if len(room.Clients) > 0 || time.Since(room.LastActivity) < 3*time.Minute {
		return
	}
	delete(m.rooms, room.Code)
	room.Close()

	log.Printf("deleted room: %s", room.Code)
}

func (m *manager) GetRoomByCode(code string) *services.Room {
	return m.rooms[code]
}
