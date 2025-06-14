package handlers

import (
	"net/http"
	"organizer-backend/config"
	"organizer-backend/models"

	"github.com/gin-gonic/gin"
)

type CreateKnowledgeLinkInput struct {
	URL   string `json:"url" binding:"required,url"`
	Title string `json:"title"`
}

// GetKnowledgeLinks godoc
// @Summary Get all knowledge links for the authenticated user
// @Description Retrieves a list of knowledge links for the current user
// @Tags knowledge-links
// @Produce json
// @Security BearerAuth
// @Success 200 {array} models.KnowledgeLink
// @Failure 401 {object} object "Unauthorized"
// @Failure 500 {object} object "Internal server error (e.g., {"error": "Failed to retrieve knowledge links"})"
// @Router /knowledge-links [get]
func GetKnowledgeLinks(c *gin.Context) {
	userID, _ := c.Get("userID")

	var links []models.KnowledgeLink
	if err := config.DB.Where("user_id = ?", userID).Order("created_at DESC").Find(&links).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve knowledge links", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, links)
}

// CreateKnowledgeLink godoc
// @Summary Create a new knowledge link
// @Description Add a new knowledge link for the authenticated user
// @Tags knowledge-links
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param link body CreateKnowledgeLinkInput true "Knowledge Link data"
// @Success 201 {object} models.KnowledgeLink
// @Failure 400 {object} object "Invalid input (e.g., {"error": "Invalid input: ..."})"
// @Failure 401 {object} object "Unauthorized"
// @Failure 500 {object} object "Internal server error (e.g., {"error": "Failed to create knowledge link"})"
// @Router /knowledge-links [post]
func CreateKnowledgeLink(c *gin.Context) {
	userID, _ := c.Get("userID")

	var input CreateKnowledgeLinkInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	link := models.KnowledgeLink{
		UserID: userID.(uint),
		URL:    input.URL,
		Title:  input.Title,
	}

	if err := config.DB.Create(&link).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create knowledge link", "details": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, link)
}

// DeleteKnowledgeLink godoc
// @Summary Delete a knowledge link by ID
// @Description Deletes a specific knowledge link by its ID, if it belongs to the authenticated user
// @Tags knowledge-links
// @Produce json
// @Security BearerAuth
// @Param id path int true "Knowledge Link ID"
// @Success 200 {object} object "Knowledge link deleted successfully (e.g., {"message": "Knowledge link deleted successfully"})"
// @Failure 401 {object} object "Unauthorized"
// @Failure 404 {object} object "Knowledge link not found or access denied"
// @Failure 500 {object} object "Internal server error (e.g., {"error": "Failed to delete knowledge link"})"
// @Router /knowledge-links/{id} [delete]
func DeleteKnowledgeLink(c *gin.Context) {
	userID, _ := c.Get("userID")
	linkID := c.Param("id")

	// Check if the link exists and belongs to the user
	var link models.KnowledgeLink
	if err := config.DB.Where("id = ? AND user_id = ?", linkID, userID).First(&link).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Knowledge link not found or access denied"})
		return
	}

	// If found, delete it
	if err := config.DB.Delete(&models.KnowledgeLink{}, linkID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete knowledge link", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Knowledge link deleted successfully"})
}
