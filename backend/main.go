package main

import (
	"log"
	"net/http"

	"github.com/csehviktor/watch-together/routes"
	"golang.org/x/net/websocket"
)

const addr = ":3000"

func main() {
	http.Handle("/createroom/", websocket.Handler(routes.HandleCreateRoom))
	http.Handle("/joinroom/{code}/", websocket.Handler(routes.HandleJoinRoom))

	log.Printf("starting socket server on addr %s", addr)

	if err := http.ListenAndServe(addr, nil); err != nil {
		log.Println(err)
	}
}
