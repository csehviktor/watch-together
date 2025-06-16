package main

import (
	"log"
	"net/http"
	"os"
	"path/filepath"

	"github.com/csehviktor/watch-together/routes"
	"golang.org/x/net/websocket"
)

const addr = ":3000"

func main() {
	http.Handle("/createroom/", websocket.Handler(routes.HandleCreateRoom))
	http.Handle("/joinroom/{code}/", websocket.Handler(routes.HandleJoinRoom))

	dist := "ui/dist"
	fs := http.FileServer(http.Dir(dist))

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fp := filepath.Join(dist, r.URL.Path)
		if stat, err := os.Stat(fp); err == nil && !stat.IsDir() {
			fs.ServeHTTP(w, r)
			return
		}

		http.ServeFile(w, r, filepath.Join(dist, "index.html"))
	})

	log.Printf("starting socket server on addr %s", addr)

	if err := http.ListenAndServe(addr, nil); err != nil {
		log.Println(err)
	}
}
