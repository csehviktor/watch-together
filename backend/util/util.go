package util

import (
	"math/rand/v2"
	"regexp"
)

var charset = []rune("abcdefghijklmnopqrstuvwxyz0123456789")

func GenerateRoomCode() string {
	b := make([]rune, 7)
	for i := range b {
		b[i] = charset[rand.IntN(len(charset))]
	}
	return string(b)
}

const youtubePattern = `^(https?:\/\/)?(www\.)?(youtube|youtu|youtube-nocookie)\.(com|be)\/(watch\?v=|embed\/|v\/|.+\?v=)?([^&=%\?]{11})`

func IsYoutubeVideo(url any) bool {
	switch v := url.(type) {
	case string:
		re := regexp.MustCompile(youtubePattern)
		return re.MatchString(v)
	default:
		return false
	}
}
