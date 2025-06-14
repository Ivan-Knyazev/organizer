package handlers

import (
	"net/http"
	"organizer-backend/config"
	"organizer-backend/models"
	"strconv"

	"github.com/gin-gonic/gin"
)

type CreateNoteInput struct {
	Title   string `json:"title"`
	Content string `json:"content" binding:"required"`
}

type UpdateNoteInput struct {
	Title   string `json:"title"`
	Content string `json:"content"`
}

// GetNotes godoc
// @Summary Get all notes for the authenticated user
// @Description Retrieves a paginated list of notes for the current user
// @Tags notes
// @Produce json
// @Security BearerAuth
// @Param limit query int false "Limit per page" default(10)
// @Param offset query int false "Offset for pagination" default(0)
// @Success 200 {object} handlers.PaginatedNotesResponse "A list of notes with total count"
// @Failure 400 {object} object "Invalid limit or offset parameters (e.g., {\"error\": \"Invalid limit or offset parameters\"})"
// @Failure 401 {object} object "Unauthorized"
// @Failure 500 {object} object "Internal server error (e.g., {\"error\": \"Failed to count notes\"})"
// @Router /notes [get]
func GetNotes(c *gin.Context) {
	userID, _ := c.Get("userID")

	limitQuery := c.DefaultQuery("limit", "10")
	offsetQuery := c.DefaultQuery("offset", "0")

	limit, errLimit := strconv.Atoi(limitQuery)
	offset, errOffset := strconv.Atoi(offsetQuery)

	if errLimit != nil || errOffset != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid limit or offset parameters"})
		return
	}

	var notes []models.Note
	var totalCount int64

	// Get total count first
	if err := config.DB.Model(&models.Note{}).Where("user_id = ?", userID).Count(&totalCount).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count notes", "details": err.Error()})
		return
	}

	// Then get paginated notes
	if err := config.DB.Where("user_id = ?", userID).Order("created_at DESC").Limit(limit).Offset(offset).Find(&notes).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve notes", "details": err.Error()})
		return
	}

	// GORM AfterFind hook in models/note.go will set the "Date" field

	c.JSON(http.StatusOK, gin.H{"notes": notes, "totalCount": totalCount})
}

// CreateNote godoc
// @Summary Create a new note
// @Description Add a new note for the authenticated user
// @Tags notes
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param note body CreateNoteInput true "Note data"
// @Success 201 {object} models.Note
// @Failure 400 {object} object "Invalid input (e.g., {\"error\": \"Invalid input: ...\"})"
// @Failure 401 {object} object "Unauthorized"
// @Failure 500 {object} object "Internal server error (e.g., {\"error\": \"Failed to create note\"})"
// @Router /notes [post]
func CreateNote(c *gin.Context) {
	userID, _ := c.Get("userID")

	var input CreateNoteInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	note := models.Note{
		UserID:  userID.(uint),
		Title:   input.Title,
		Content: input.Content,
	}

	if err := config.DB.Create(&note).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create note", "details": err.Error()})
		return
	}

	note.Date = note.CreatedAt.Format("2006-01-02 15:04")

	c.JSON(http.StatusCreated, note)
}

// GetNote godoc
// @Summary Get a single note by ID
// @Description Retrieves a specific note by its ID, if it belongs to the authenticated user
// @Tags notes
// @Produce json
// @Security BearerAuth
// @Param id path int true "Note ID"
// @Success 200 {object} models.Note
// @Failure 401 {object} object "Unauthorized"
// @Failure 404 {object} object "Note not found or access denied (e.g., {\"error\": \"Note not found or access denied\"})"
// @Failure 500 {object} object "Internal server error"
// @Router /notes/{id} [get]
func GetNote(c *gin.Context) {
	userID, _ := c.Get("userID")
	noteID := c.Param("id")

	var note models.Note
	if err := config.DB.Where("id = ? AND user_id = ?", noteID, userID).First(&note).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Note not found or access denied"})
		return
	}
	note.Date = note.CreatedAt.Format("2006-01-02 15:04")
	c.JSON(http.StatusOK, note)
}

// UpdateNote godoc
// @Summary Update an existing note
// @Description Updates a specific note by its ID, if it belongs to the authenticated user
// @Tags notes
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Note ID"
// @Param note body UpdateNoteInput true "Updated note data"
// @Success 200 {object} models.Note
// @Failure 400 {object} object "Invalid input"
// @Failure 401 {object} object "Unauthorized"
// @Failure 404 {object} object "Note not found or access denied"
// @Failure 500 {object} object "Internal server error (e.g., {\"error\": \"Failed to update note\"})"
// @Router /notes/{id} [put]
func UpdateNote(c *gin.Context) {
	userID, _ := c.Get("userID")
	noteID := c.Param("id")

	var note models.Note
	if err := config.DB.Where("id = ? AND user_id = ?", noteID, userID).First(&note).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Note not found or access denied"})
		return
	}

	var input UpdateNoteInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// note.Title = input.Title
	// note.Content = input.Content
	updateData := models.Note{Title: input.Title, Content: input.Content}

	if err := config.DB.Model(note).Updates(updateData).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update note", "details": err.Error()})
		return
	}
	note.Date = note.UpdatedAt.Format("2006-01-02 15:04")

	c.JSON(http.StatusOK, note)
}

// DeleteNote godoc
// @Summary Delete a note by ID
// @Description Deletes a specific note by its ID, if it belongs to the authenticated user
// @Tags notes
// @Produce json
// @Security BearerAuth
// @Param id path int true "Note ID"
// @Success 200 {object} object "Note deleted successfully (e.g., {\"message\": \"Note deleted successfully\"})"
// @Failure 401 {object} object "Unauthorized"
// @Failure 404 {object} object "Note not found or access denied"
// @Failure 500 {object} object "Internal server error (e.g., {\"error\": \"Failed to delete note\"})"
// @Router /notes/{id} [delete]
func DeleteNote(c *gin.Context) {
	userID, _ := c.Get("userID")
	noteID := c.Param("id")

	// First check if the note exists and belongs to the user
	var note models.Note
	if err := config.DB.Where("id = ? AND user_id = ?", noteID, userID).First(&note).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Note not found or access denied"})
		return
	}

	// If found, delete it
	if err := config.DB.Delete(&models.Note{}, noteID).Error; err != nil { // Delete by primary key
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete note", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Note deleted successfully"})
}
