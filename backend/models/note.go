package models

import (
	"time"

	"gorm.io/gorm"
)

type Note struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `gorm:"not null" json:"userId"` // Foreign key
	User      User      `gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;" json:"-"`
	Title     string    `json:"title"`
	Content   string    `gorm:"type:text" json:"content"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
	Date      string    `gorm:"-" json:"date"`
}

// GORM Hook to set Date field for frontend compatibility
func (n *Note) AfterFind(tx *gorm.DB) (err error) {
	n.Date = n.CreatedAt.Format("2006-01-02 15:04")
	return
}
