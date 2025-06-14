package routes

import (
	"organizer-backend/handlers"
	"organizer-backend/middleware"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	"time"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()

	// CORS middleware configuration using gin-contrib/cors
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:3000"}
	config.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization"}
	config.ExposeHeaders = []string{"Content-Length"}
	config.AllowCredentials = true
	config.MaxAge = 12 * time.Hour // Опционально: как долго результаты preflight-запроса могут кэшироваться

	r.Use(cors.New(config))

	api := r.Group("/api")
	{
		auth := api.Group("/auth")
		{
			auth.POST("/register", handlers.RegisterUser)
			auth.POST("/login", handlers.LoginUser)
			// auth.POST("/validate-token", handlers.ValidateUserToken)
		}

		userRoutes := api.Group("/users")
		userRoutes.Use(middleware.AuthMiddleware())
		{
			userRoutes.GET("/me", handlers.GetUserProfile)
			userRoutes.PUT("/me", handlers.UpdateUserProfile)
			userRoutes.POST("/me/password", handlers.ChangeUserPassword)
		}

		notesRoutes := api.Group("/notes")
		notesRoutes.Use(middleware.AuthMiddleware())
		{
			notesRoutes.GET("", handlers.GetNotes)
			notesRoutes.POST("", handlers.CreateNote)
			notesRoutes.GET("/:id", handlers.GetNote)
			notesRoutes.PUT("/:id", handlers.UpdateNote)
			notesRoutes.DELETE("/:id", handlers.DeleteNote)
		}

		kbRoutes := api.Group("/knowledge-links")
		kbRoutes.Use(middleware.AuthMiddleware())
		{
			kbRoutes.GET("", handlers.GetKnowledgeLinks)
			kbRoutes.POST("", handlers.CreateKnowledgeLink)
			kbRoutes.DELETE("/:id", handlers.DeleteKnowledgeLink)
		}
		api.GET("/weather", handlers.GetWeatherByCity)
	}
	return r
}
