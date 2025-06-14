package main

import (
	"log"
	"organizer-backend/config"
	_ "organizer-backend/docs"
	"organizer-backend/handlers"
	"organizer-backend/routes"
	"organizer-backend/utils"

	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

// ОБЩИЕ АННОТАЦИИ ДЛЯ ВСЕГО API (for 'swag init')
// @title Organizer API
// @version 1.0
// @description This is the API for the Organizer application, providing a way to manage personal productivity modules.
// @termsOfService http://swagger.io/terms/

// @contact.name API Support Team
// @contact.url https://www.example.com/support
// @contact.email kiv.426@google.com

// @license.name Apache 2.0
// @license.url http://www.apache.org/licenses/LICENSE-2.0.html

// @host localhost:8080
// @BasePath /api

// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description Type "Bearer" followed by a space and JWT token. Example: "Bearer {token}"
// @schemes http https

func main() {
	config.LoadEnv()                 // Load .env first
	config.ConnectDatabase()         // Connect to Postgres
	utils.InitJWT()                  // Initialize JWT secret
	handlers.InitializeWeatherKeys() // Initialize Weather Keys (API)

	router := routes.SetupRouter()
	// gin.SetMode(gin.ReleaseMode)  // For Production

	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	apiPort := config.GetEnv("API_PORT", "8080")
	apiHost := config.GetEnv("API_HOST", "localhost")
	log.Printf("Starting server on port %s", apiPort)
	log.Printf("Swagger UI available at http://%s:%s/swagger/index.html", apiHost, apiPort)
	if err := router.Run(":" + apiPort); err != nil {
		log.Fatal("Failed to run server: ", err)
	}
}
