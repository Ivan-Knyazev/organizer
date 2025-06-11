package models

import (
	"time"
)

type User struct {
	ID             uint            `gorm:"primaryKey" json:"id"`
	Email          string          `gorm:"uniqueIndex;not null" json:"email"`
	PasswordHash   string          `gorm:"not null" json:"-"` // Don't send password hash in request JSON
	Fullname       string          `json:"fullname"`
	Age            int             `json:"age"`
	Contacts       string          `json:"contacts"`
	TelegramHash   string          `json:"telegramHash"`
	CreatedAt      time.Time       `json:"createdAt"`
	UpdatedAt      time.Time       `json:"updatedAt"`
	Notes          []Note          `gorm:"foreignKey:UserID" json:"-"` // For GORM relations
	KnowledgeLinks []KnowledgeLink `gorm:"foreignKey:UserID" json:"-"` // For GORM relations
}
