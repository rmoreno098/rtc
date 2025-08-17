package internal

import (
	"encoding/json"
	"github.com/pocketbase/pocketbase/core"
)

func (h *Hub) StatusHandler() func(*core.RequestEvent) error {
	return func(c *core.RequestEvent) error {
		var x []string
		for client := range h.clients {
			x = append(x, client.id)
		}
		json.NewEncoder(c.Response).Encode(x)
		return nil
	}
}

func (h *Hub) ConnectHandler() func(*core.RequestEvent) error {
	return func(c *core.RequestEvent) error {
		client, err := NewClient(c.Response, c.Request, h)
		if err != nil {
			return err
		}

		h.inbound <- client // Register client on hub
		client.Serve()

		return nil
	}
}
