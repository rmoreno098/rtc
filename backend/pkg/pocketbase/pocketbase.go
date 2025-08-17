package pocketbase

import (
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
	"rtc/internal"
)

func NewPocketBase(hub *internal.Hub) *pocketbase.PocketBase {
	app := pocketbase.New()
	registerRoutes(app, hub)
	return app
}

func registerRoutes(app *pocketbase.PocketBase, hub *internal.Hub) {
	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		se.Router.GET("/api/map/status", hub.StatusHandler())
		se.Router.GET("/api/rtc/connect", hub.ConnectHandler())
		return se.Next()
	})
}
