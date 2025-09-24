package main

import (
	"log"
	"rtc/config"
	"rtc/internal/server"
	"rtc/internal/services"
)

func main() {
	cfg := config.Load()
	jwt := services.NewJwtService(cfg.Jwt)
	hub := services.NewHub()
	app := server.New(hub, jwt)

	if err := app.Run(); err != nil {
		log.Fatal(err)
	}
}
