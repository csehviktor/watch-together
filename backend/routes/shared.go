package routes

import (
	"net/http"

	m "github.com/csehviktor/watch-together/manager"
)

var manager = m.Instance()

func usernameFromRequest(r *http.Request) (string, error) {
	ucookie, err := r.Cookie("username")
	if err != nil {
		return "", err
	}
	return ucookie.Value, nil
}
