package routes

import (
	"github.com/Wei-Shaw/sub2api/internal/server/middleware"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"

	"github.com/gin-gonic/gin"
)

// RegisterSwaggerRoutes exposes interactive OpenAPI docs (Swagger UI).
// Access is restricted to localhost / 127.0.0.1 only.
func RegisterSwaggerRoutes(r *gin.Engine) {
	swagger := r.Group("/swagger")
	swagger.Use(middleware.LocalhostOnly())
	swagger.GET("/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
}
