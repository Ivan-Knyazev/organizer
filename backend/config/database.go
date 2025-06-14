package config

import (
	"fmt"
	"log"
	"organizer-backend/models"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDatabase() {
	LoadEnv()

	dbHost := GetEnv("POSTGRES_HOST", "localhost")
	dbPort := GetEnv("POSTGRES_PORT", "5432")
	dbUser := GetEnv("POSTGRES_USER", "organizer_user")
	dbPassword := GetEnv("POSTGRES_PASSWORD", "organizer_password")
	dbName := GetEnv("POSTGRES_DB", "organizer_db")

	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=UTC",
		dbHost, dbUser, dbPassword, dbName, dbPort)

	database, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
		os.Exit(1)
	}

	log.Println("Database connection established.")

	// Auto-migrate schema
	err = database.AutoMigrate(&models.User{}, &models.Note{}, &models.KnowledgeLink{})
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
		os.Exit(1)
	}
	log.Println("Database migrated.")

	DB = database
}
