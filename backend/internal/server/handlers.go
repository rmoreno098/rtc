package server

import (
	"encoding/json"
	"net/http"
	"rtc/internal/services"

	"github.com/pocketbase/pocketbase/core"
)

func statusHandler(h *services.Hub) func(*core.RequestEvent) error {
	return func(c *core.RequestEvent) error {
		var x []string
		for client := range h.Clients {
			x = append(x, client.Id)
		}
		return json.NewEncoder(c.Response).Encode(x)
	}
}

func connectHandler(h *services.Hub) func(*core.RequestEvent) error {
	return func(c *core.RequestEvent) error {
		client, err := services.NewClient(c, h)
		if err != nil {
			return err
		}

		h.Inbound <- client // Register client on hub
		client.Serve()

		return c.String(http.StatusOK, "OK")
	}
}
