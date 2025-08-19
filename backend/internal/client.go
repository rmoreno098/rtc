package internal

import (
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
	outbound chan []byte
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
	defer c.close()
	for {
		_, data, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsCloseError(err, websocket.CloseNormalClosure) {
				log.Printf("client %v disconnected", c.id)
				return
			}
			if websocket.IsCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("client %v lost connection", c.id)
				return
			}
			log.Printf("an unexpected error occurred: %v", err)
			return
		}
		c.hub.broadcast <- data
	}
}

// write continuously reads from the outbound channel and writes data to the WebSocket connection
func (c *Client) write() {
	log.Printf("client %v sent a message", c.id)
	for data := range c.outbound {
		c.conn.WriteMessage(websocket.TextMessage, data)
	}
}

func (c *Client) close() {
	if err := c.conn.Close(); err != nil {
		log.Printf("something happened trying to close the connection: %v", err)
	}
	c.hub.disconnect <- c
}
