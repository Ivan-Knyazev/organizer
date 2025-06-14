package handlers

import (
	"fmt"
	"net/http"
	"organizer-backend/config"
	"organizer-backend/models"
	"organizer-backend/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// RegisterInput defines the structure for user registration request body.
type RegisterInput struct {
	Email    string `json:"email" binding:"required,email" example:"user@example.com"`
	Password string `json:"password" binding:"required,min=6" example:"password123"`
	Fullname string `json:"fullname" example:"John Doe"`
	Age      int    `json:"age" example:"30"`
	Contacts string `json:"contacts" example:"+1234567890"`
}

// UserAuthResponse defines the structure for successful authentication responses.
type UserAuthResponse struct {
	Token string      `json:"token" example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."`
	User  models.User `json:"user"` // User model without PasswordHash
}

// RegisterUser godoc
// @Summary Register a new user
// @Description Creates a new user account and returns a JWT token.
// @Tags auth
// @Accept  json
// @Produce  json
// @Param   user body RegisterInput true "User Registration Data"
// @Success 201 {object} UserAuthResponse "Successfully registered"
// @Failure 400 {object} object "Validation error or invalid input (e.g., {\"error\": \"Invalid input: Key: 'RegisterInput.Email' Error:Field validation for 'Email' failed on the 'email' tag\"})"
// @Failure 409 {object} object "User with this email already exists (e.g., {\"error\": \"User with this email already exists\"})"
// @Failure 500 {object} object "Internal server error (e.g., {\"error\": \"Failed to hash password\"})"
// @Router /auth/register [post]
func RegisterUser(c *gin.Context) {
	var input RegisterInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input: " + err.Error()})
		return
	}

	hashedPassword, err := utils.HashPassword(input.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	user := models.User{
		Email:        input.Email,
		PasswordHash: hashedPassword,
		Fullname:     input.Fullname,
		Age:          input.Age,
		Contacts:     input.Contacts,
	}

	// Check if user already exists
	var existingUser models.User
	if err := config.DB.Where("email = ?", input.Email).First(&existingUser).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "User with this email already exists"})
		return
	} else if err != gorm.ErrRecordNotFound {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error checking existing user", "details": err.Error()})
		return
	}

	if err := config.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user", "details": err.Error()})
		return
	}

	token, err := utils.GenerateJWT(user.ID, user.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}
	// Prepare user response without sensitive data
	userResponse := models.User{
		ID: user.ID, Email: user.Email, Fullname: user.Fullname, Age: user.Age,
		Contacts: user.Contacts, TelegramHash: user.TelegramHash, // Include TelegramHash if it's set during registration or by default
		CreatedAt: user.CreatedAt, UpdatedAt: user.UpdatedAt,
	}

	c.JSON(http.StatusCreated, UserAuthResponse{Token: token, User: userResponse})
}

// LoginInput defines the structure for user login request body.
type LoginInput struct {
	Email    string `json:"email" binding:"required,email" example:"user@example.com"`
	Password string `json:"password" binding:"required" example:"password123"`
}

// LoginUser godoc
// @Summary Log in an existing user
// @Description Authenticates a user and returns a JWT token upon successful login.
// @Tags auth
// @Accept  json
// @Produce  json
// @Param   credentials body LoginInput true "User Login Credentials"
// @Success 200 {object} UserAuthResponse "Successfully logged in"
// @Failure 400 {object} object "Validation error or invalid input (e.g., {\"error\": \"Invalid input: ...\"})"
// @Failure 401 {object} object "Invalid credentials (e.g., {\"error\": \"Invalid credentials\"})"
// @Failure 500 {object} object "Internal server error (e.g., {\"error\": \"Database error finding user\"})"
// @Router /auth/login [post]
func LoginUser(c *gin.Context) {
	var input LoginInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input: " + err.Error()})
		return
	}

	var user models.User
	if err := config.DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error finding user", "details": err.Error()})
		return
	}

	if !utils.CheckPasswordHash(input.Password, user.PasswordHash) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	token, err := utils.GenerateJWT(user.ID, user.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	userResponse := models.User{
		ID: user.ID, Email: user.Email, Fullname: user.Fullname, Age: user.Age,
		Contacts: user.Contacts, TelegramHash: user.TelegramHash,
		CreatedAt: user.CreatedAt, UpdatedAt: user.UpdatedAt,
	}

	c.JSON(http.StatusOK, UserAuthResponse{Token: token, User: userResponse})
}

// Optional: Handler for token validation (can be useful for client-side checks or refresh logic)
// ValidateUserToken godoc
// @Summary Validate JWT Token and get user info
// @Description Validates the provided JWT and returns user information if valid.
// @Tags auth
// @Produce  json
// @Security BearerAuth
// @Success 200 {object} models.User "User data for valid token"
// @Failure 401 {object} object "Unauthorized or invalid token (e.g., {\"error\": \"Unauthorized or invalid token\"})"
// @Router /auth/validate-token [post] // Or GET, depending on preference
func ValidateUserToken(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		// This case should ideally be caught by AuthMiddleware itself,
		// but as a double-check or if used without middleware for some reason.
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token missing or invalid"})
		return
	}

	userEmail, _ := c.Get("userEmail")
	fmt.Print(userEmail)

	// If middleware already validated, we can directly fetch user or just confirm
	var user models.User
	if err := config.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User associated with token not found"})
		return
	}
	user.PasswordHash = "" // Clear password hash

	c.JSON(http.StatusOK, user)
}
