package internal

import (
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"log"
	"net/http"
)

type Client struct {
	id       string
	conn     *websocket.Conn
	outbound chan []byte
	hub      *Hub
}

func NewClient(w http.ResponseWriter, r *http.Request, hub *Hub) (*Client, error) {
	upgrader := websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("Unable to upgrade to websocket %v\n", err)
		return nil, err
	}

	return &Client{
		id:       uuid.New().String(),
		conn:     conn,
		outbound: make(chan []byte),
		hub:      hub,
	}, nil
}

// Serve starts concurrent read and write operations for the client
func (c *Client) Serve() {
	go c.read()
	go c.write()
}

// read continuously reads messages from the WebSocket and closes the connection on error
func (c *Client) read() {
	defer func() {
		c.conn.Close()
		c.hub.disconnect <- c
	}()
	for {
		err := c.conn.ReadJSON(&c.outbound)
		if err != nil {
			if websocket.IsUnexpectedCloseError(err) {
				log.Printf("Client %v disconnected\n", c.id)
			}
			break
		}
	}
}

// write continuously reads from the outbound channel and sends data to the hub's broadcast channel
func (c *Client) write() {
	defer func() {
		c.conn.Close()
	}()
	for {
		select {
		case data := <-c.outbound:
			c.hub.broadcast <- data
		}
	}
}
