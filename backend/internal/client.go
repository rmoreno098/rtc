package internal

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

type Message struct {
	Id      string `json:"id"`
	Type    string `json:"type"`
	Message string `json:"message"`
}

type Client struct {
	id       string
	conn     *websocket.Conn
	outbound chan []Message
	hub      *Hub
}

func NewClient(w http.ResponseWriter, r *http.Request, hub *Hub) (*Client, error) {
	upgrader := websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
		CheckOrigin:     func(r *http.Request) bool { return true },
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("unable to upgrade to websocket %v\n", err)
		return nil, err
	}

	return &Client{
		id:       uuid.New().String(),
		conn:     conn,
		outbound: make(chan []Message),
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
	for {
		log.Printf("message received: %v", c.outbound)
		z, _ := json.Marshal(&c.outbound)
		log.Print(z)
		err := c.conn.ReadJSON(&c.outbound)
		if err != nil {
			if websocket.IsUnexpectedCloseError(err) {
				log.Printf("client %v disconnected\n", c.id)
			}
			log.Printf("an unexpected error occurred: %v", err)
			break
		}
	}
	c.close()
}

// write continuously reads from the outbound channel and sends data to the hub's broadcast channel
func (c *Client) write() {
	for data := range c.outbound {
		log.Printf("client %v sent a message: %v", c.id, data)
		c.hub.broadcast <- data
	}
}

func (c *Client) close() {
	if err := c.conn.Close(); err != nil {
		log.Printf("something happened trying to close the connection: %v", err)
	}
	c.hub.disconnect <- c
}
