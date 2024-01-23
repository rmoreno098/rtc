package main

import (
	"log"
	"net/http"

	"github.com/labstack/echo/v5"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/models"
	"github.com/pocketbase/pocketbase/apis"
)

func main() {
	app := pocketbase.New()

	app.OnBeforeServe().Add(func(e *core.ServeEvent) error {
		log.Println("this is before serve!")

		e.Router.GET("/test", func(c echo.Context) error {
			collection, err := app.Dao().FindCollectionByNameOrId("users")
			if err != nil {
				return apis.NewNotFoundError("Failed to fetch example collection.", err)
			}
			record := models.NewRecord(collection)

			return c.JSON(http.StatusOK, record)

		})

		return nil
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}