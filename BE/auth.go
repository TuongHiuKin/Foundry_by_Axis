package main

import (
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/jackc/pgx/v5"
	"golang.org/x/crypto/bcrypt"
)

var (
	jwtSecret  []byte
	adminEmail string
)

type User struct {
	ID        int64     `json:"id"`
	Email     string    `json:"email"`
	Name      string    `json:"name"`
	Role      string    `json:"role"`
	CreatedAt time.Time `json:"created_at"`
}

// ---------- Đăng ký ----------

type registerInput struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	Name     string `json:"name" binding:"required"`
}

func register(c *gin.Context) {
	var in registerInput
	if err := c.ShouldBindJSON(&in); err != nil {
		c.JSON(400, gin.H{"error": "Email, mật khẩu (ít nhất 6 ký tự) và tên là bắt buộc"})
		return
	}
	in.Email = strings.ToLower(strings.TrimSpace(in.Email))

	// Không bao giờ lưu mật khẩu gốc, chỉ lưu bản đã băm (hash).
	hash, err := bcrypt.GenerateFromPassword([]byte(in.Password), bcrypt.DefaultCost)
	if err != nil {
		serverError(c, err)
		return
	}

	role := "user"
	if adminEmail != "" && strings.EqualFold(in.Email, adminEmail) {
		role = "admin"
	}

	var u User
	err = db.QueryRow(c,
		`INSERT INTO users (email, password_hash, name, role)
		 VALUES ($1, $2, $3, $4)
		 ON CONFLICT (email) DO NOTHING
		 RETURNING id, email, name, role, created_at`,
		in.Email, string(hash), in.Name, role,
	).Scan(&u.ID, &u.Email, &u.Name, &u.Role, &u.CreatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		c.JSON(409, gin.H{"error": "Email này đã được đăng ký"})
		return
	}
	if err != nil {
		serverError(c, err)
		return
	}
	sendToken(c, u)
}

// ---------- Đăng nhập ----------

type loginInput struct {
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
}

func login(c *gin.Context) {
	var in loginInput
	if err := c.ShouldBindJSON(&in); err != nil {
		c.JSON(400, gin.H{"error": "Vui lòng nhập email và mật khẩu"})
		return
	}

	var u User
	var hash string
	err := db.QueryRow(c,
		`SELECT id, email, name, role, created_at, password_hash FROM users WHERE email = $1`,
		strings.ToLower(strings.TrimSpace(in.Email)),
	).Scan(&u.ID, &u.Email, &u.Name, &u.Role, &u.CreatedAt, &hash)

	// Sai email hay sai mật khẩu đều báo chung một câu, để người lạ không dò được email.
	if err != nil || bcrypt.CompareHashAndPassword([]byte(hash), []byte(in.Password)) != nil {
		c.JSON(401, gin.H{"error": "Email hoặc mật khẩu không đúng"})
		return
	}
	sendToken(c, u)
}

// sendToken tạo JWT có hạn 7 ngày và gửi về cùng thông tin user.
func sendToken(c *gin.Context, u User) {
	claims := jwt.MapClaims{
		"sub":  u.ID,
		"role": u.Role,
		"exp":  time.Now().Add(7 * 24 * time.Hour).Unix(),
	}
	token, err := jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString(jwtSecret)
	if err != nil {
		serverError(c, err)
		return
	}
	c.JSON(200, gin.H{"token": token, "user": u})
}

func me(c *gin.Context) {
	var u User
	err := db.QueryRow(c,
		`SELECT id, email, name, role, created_at FROM users WHERE id = $1`, currentUserID(c),
	).Scan(&u.ID, &u.Email, &u.Name, &u.Role, &u.CreatedAt)
	if err != nil {
		c.JSON(401, gin.H{"error": "Tài khoản không còn tồn tại"})
		return
	}
	c.JSON(200, u)
}

// ---------- Middleware ----------

// requireLogin kiểm tra header "Authorization: Bearer <token>".
// Nếu hợp lệ thì lưu userID và role vào context cho các handler phía sau dùng.
func requireLogin(c *gin.Context) {
	header := c.GetHeader("Authorization")
	tokenStr, ok := strings.CutPrefix(header, "Bearer ")
	if !ok {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Bạn cần đăng nhập"})
		return
	}

	claims := jwt.MapClaims{}
	_, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (any, error) {
		return jwtSecret, nil
	}, jwt.WithValidMethods([]string{"HS256"}))
	if err != nil {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Phiên đăng nhập đã hết hạn"})
		return
	}

	// Số trong JWT được đọc ra dưới dạng float64.
	sub, _ := claims["sub"].(float64)
	role, _ := claims["role"].(string)
	c.Set("userID", int64(sub))
	c.Set("role", role)
	c.Next()
}

func requireAdmin(c *gin.Context) {
	if c.GetString("role") != "admin" {
		c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "Chỉ admin mới được vào"})
		return
	}
	c.Next()
}

func currentUserID(c *gin.Context) int64 {
	return c.GetInt64("userID")
}
