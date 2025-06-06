package services

import (
	"github.com/csehviktor/watch-together/util"
)

type videoState string

const (
	statePlaying videoState = "playing"
	statePaused  videoState = "paused"
)

type video struct {
	Url       string     `json:"url"`
	State     videoState `json:"state"`
	Timestamp int        `json:"timestamp"`
}

func newVideo(url string) *video {
	if !util.IsYoutubeVideo(url) {
		return nil
	}

	return &video{
		Url:   url,
		State: statePaused,
	}
}

func (v *video) pauseVideo() {
	v.State = statePaused
}

func (v *video) unpauseVideo() {
	v.State = statePlaying
}

func (v *video) seekTo(timestamp int) {
	v.Timestamp = timestamp
}
