package models

import "time"

type KnowledgeLink struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `gorm:"not null" json:"userId"`
	User      User      `gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;" json:"-"`
	URL       string    `gorm:"not null" json:"url"`
	Title     string    `json:"title"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}
