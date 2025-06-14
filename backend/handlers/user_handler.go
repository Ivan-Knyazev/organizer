package handlers

import (
	"fmt"
	"net/http"
	"organizer-backend/config"
	"organizer-backend/models"
	"organizer-backend/utils"

	"github.com/gin-gonic/gin"
)

// GetUserProfile godoc
// @Summary Get current user's profile
// @Description Get profile information for the authenticated user
// @Tags users
// @Produce json
// @Security BearerAuth
// @Success 200 {object} models.User
// @Failure 401 {object} object "Unauthorized (e.g., {\"error\": \"User ID not found in token\"})"
// @Failure 404 {object} object "User not found (e.g., {\"error\": \"User not found\"})"
// @Failure 500 {object} object "Internal server error"
// @Router /users/me [get]
func GetUserProfile(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in token"})
		return
	}

	var user models.User
	if err := config.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Ensure password hash is not sent
	user.PasswordHash = ""

	c.JSON(http.StatusOK, user)
}

type UpdateUserProfileInput struct {
	Fullname string `json:"fullname"`
	Age      int    `json:"age"`
	Contacts string `json:"contacts"`
	// Email is generally not updated this way directly due to uniqueness and verification needs.
	// TelegramHash might be updated via a different mechanism (e.g., bot interaction).
}

// UpdateUserProfile godoc
// @Summary Update current user's profile
// @Description Update profile information for the authenticated user
// @Tags users
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param profile body UpdateUserProfileInput true "Profile Update Data"
// @Success 200 {object} models.User
// @Failure 400 {object} object "Invalid input (e.g., {\"error\": \"Возраст должен быть корректным положительным числом\"})"
// @Failure 401 {object} object "Unauthorized"
// @Failure 404 {object} object "User not found"
// @Failure 500 {object} object "Internal server error (e.g., {\"error\": \"Failed to update profile\"})"
// @Router /users/me [put]
func UpdateUserProfile(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in token"})
		return
	}

	var input UpdateUserProfileInput
	if err := c.ShouldBindJSON(&input); err != nil {
		fmt.Println(err.Error())
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if err := config.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Update fields
	user.Fullname = input.Fullname
	user.Age = input.Age
	user.Contacts = input.Contacts

	if err := config.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update profile", "details": err.Error()})
		return
	}

	user.PasswordHash = "" // Don't send hash back
	c.JSON(http.StatusOK, user)
}

type ChangePasswordInput struct {
	CurrentPassword string `json:"currentPassword" binding:"required"`
	NewPassword     string `json:"newPassword" binding:"required,min=6"`
}

// ChangeUserPassword godoc
// @Summary Change current user's password
// @Description Change password for the authenticated user
// @Tags users
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param passwords body ChangePasswordInput true "Password Change Data"
// @Success 200 {object} object "Password changed successfully (e.g., {\"message\": \"Password changed successfully\"})"
// @Failure 400 {object} object "Invalid input (e.g., {\"error\": \"Новые пароли не совпадают\"})"
// @Failure 401 {object} object "Unauthorized or incorrect current password (e.g., {\"error\": \"Incorrect current password\"})"
// @Failure 404 {object} object "User not found"
// @Failure 500 {object} object "Internal server error (e.g., {\"error\": \"Failed to update password\"})"
// @Router /users/me/password [post]
func ChangeUserPassword(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in token"})
		return
	}

	var input ChangePasswordInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if err := config.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	if !utils.CheckPasswordHash(input.CurrentPassword, user.PasswordHash) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Incorrect current password"})
		return
	}

	newHashedPassword, err := utils.HashPassword(input.NewPassword)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash new password"})
		return
	}

	user.PasswordHash = newHashedPassword
	if err := config.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update password", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Password changed successfully"})
}
