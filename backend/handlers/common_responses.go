package handlers

import "organizer-backend/models"

type ErrorResponse struct {
	Error string `json:"error" example:"Сообщение об ошибке"`
}

type MessageResponse struct {
	Message string `json:"message" example:"Успешное выполнение"`
}

type PaginatedNotesResponse struct {
	Notes      []models.Note `json:"notes"`                    // Массив заметок
	TotalCount int64         `json:"totalCount" example:"100"` // Общее количество заметок, подходящих под критерии (до пагинации)
}
