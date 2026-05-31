package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func TestLocalhostOnly(t *testing.T) {
	gin.SetMode(gin.TestMode)

	tests := []struct {
		name       string
		host       string
		wantStatus int
	}{
		{name: "127.0.0.1 with port", host: "127.0.0.1:8080", wantStatus: http.StatusOK},
		{name: "127.0.0.1 without port", host: "127.0.0.1", wantStatus: http.StatusOK},
		{name: "localhost with port", host: "localhost:8080", wantStatus: http.StatusOK},
		{name: "localhost without port", host: "localhost", wantStatus: http.StatusOK},
		{name: "ipv6 localhost with port", host: "[::1]:8080", wantStatus: http.StatusOK},
		{name: "ipv6 localhost without port", host: "::1", wantStatus: http.StatusOK},
		{name: "domain blocked", host: "ebeeai.net", wantStatus: http.StatusForbidden},
		{name: "domain with port blocked", host: "ebeeai.net:443", wantStatus: http.StatusForbidden},
		{name: "public ip blocked", host: "203.0.113.10:8080", wantStatus: http.StatusForbidden},
		{name: "empty host blocked", host: "", wantStatus: http.StatusForbidden},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			middleware := LocalhostOnly()

			w := httptest.NewRecorder()
			_, r := gin.CreateTestContext(w)
			r.GET("/swagger/index.html", middleware, func(c *gin.Context) {
				c.Status(http.StatusOK)
			})

			req := httptest.NewRequest(http.MethodGet, "/swagger/index.html", nil)
			req.Host = tt.host
			r.ServeHTTP(w, req)

			assert.Equal(t, tt.wantStatus, w.Code)
		})
	}
}
