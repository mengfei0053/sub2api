package middleware

import (
	"net"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// LocalhostOnly blocks requests whose Host is not localhost or 127.0.0.1.
func LocalhostOnly() gin.HandlerFunc {
	return func(c *gin.Context) {
		if !isLocalhostHost(c.Request.Host) {
			c.AbortWithStatus(http.StatusForbidden)
			return
		}
		c.Next()
	}
}

func isLocalhostHost(host string) bool {
	host = strings.TrimSpace(host)
	if host == "" {
		return false
	}

	hostname := host
	if h, _, err := net.SplitHostPort(host); err == nil {
		hostname = h
	}

	hostname = strings.TrimPrefix(strings.ToLower(hostname), "[")
	hostname = strings.TrimSuffix(hostname, "]")

	switch hostname {
	case "localhost", "127.0.0.1", "::1":
		return true
	default:
		return false
	}
}
