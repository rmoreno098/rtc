package services

import (
	"fmt"
	"rtc/config"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type JwtService struct {
	secret string
}

func NewJwtService(config config.JwtConfig) *JwtService {
	return &JwtService{
		secret: config.Secret,
	}
}

func (s *JwtService) GenerateToken(id string) (string, error) {
	claims := jwt.MapClaims{
		"sub": id,
		"iat": time.Now().Unix(),
		"exp": time.Now().Add(time.Minute * 15).Unix(),
	}

	t := jwt.NewWithClaims(jwt.SigningMethodES256, claims)
	return t.SignedString([]byte(s.secret))
}

func (s *JwtService) ValidateToken(token string) error {
	claims := jwt.MapClaims{}
	_, err := jwt.ParseWithClaims(token, claims, func(token *jwt.Token) (any, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return s.secret, nil
	}, jwt.WithValidMethods([]string{jwt.SigningMethodES256.Name}), jwt.WithIssuedAt(), jwt.WithLeeway(5*time.Second))
	return err
}

//func (s *JwtService) RefreshToken(token string) (string, error) {
//
//	return rToken
//}
