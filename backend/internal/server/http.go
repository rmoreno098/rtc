package server

import (
	"rtc/internal/services"
	pb "rtc/pkg/pocketbase"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
)

type App struct {
	Pb *pocketbase.PocketBase
}

func New(hub *services.Hub, jwt *services.JwtService) App {
	app := pb.NewPocketBase()
	registerRoutes(app, hub, jwt)
	return App{
		Pb: app,
	}
}

func (a *App) Run() error {
	if err := a.Pb.Start(); err != nil {
		return err
	}
	return nil
}

func registerRoutes(app *pocketbase.PocketBase, hub *services.Hub, jwt *services.JwtService) {
	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		g := se.Router.Group("/api/rtc")
		g.GET("/connect", connectHandler(hub))
		g.GET("/map/status", statusHandler(hub)).Bind(apis.RequireAuth())
		return se.Next()
	})
}
