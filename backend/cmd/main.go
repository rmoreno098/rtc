package main

import (
	"log"
	"rtc/internal"
	"rtc/pkg/pocketbase"
)

func main() {
	hub := internal.NewHub()
	app := pocketbase.NewPocketBase(hub)

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
