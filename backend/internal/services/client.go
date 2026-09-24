package services

import (
	"log"
	"net/http"

	"github.com/gorilla/websocket"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tools/types"
)

type Message struct {
	Id      string `json:"id"`
	Type    string `json:"type"`
	Message string `json:"message"`
}

type Client struct {
	Id       string
	Conn     *websocket.Conn
	Outbound chan []byte
	Hub      *Hub
}

type User struct {
	Id     string                  `db:"id" json:"id"`
	Status bool                    `db:"status" json:"status"`
	Age    int                     `db:"age" json:"age"`
	Roles  types.JSONArray[string] `db:"roles" json:"roles"`
}

func NewClient(c *core.RequestEvent, hub *Hub) (*Client, error) {
	upgrader := websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
		CheckOrigin:     func(r *http.Request) bool { return true },
		Subprotocols:    []string{"c_id"},
	}

	var user User
	err := c.App.DB().
		NewQuery("SELECT id, status, age, roles FROM users WHERE id=1").
		One(&user)
	if err != nil {
		return nil, err
	}

	conn, err := upgrader.Upgrade(c.Response, c.Request, nil)
	if err != nil {
		log.Printf("unable to upgrade to websocket %v\n", err)
		return nil, err
	}

	return &Client{
		Id:       user.Id,
		Conn:     conn,
		Outbound: make(chan []byte),
		Hub:      hub,
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
		_, data, err := c.Conn.ReadMessage()
		if err := c.validRead(err); err != nil {
			return
		}
		c.Hub.Broadcast <- data
	}
}

// write continuously reads from the outbound channel and writes data to the WebSocket connection
func (c *Client) write() {
	for data := range c.Outbound {
		c.Conn.WriteMessage(websocket.TextMessage, data)
	}
	log.Printf("client %v sent a message", c.Id)
}

func (c *Client) close() {
	if err := c.Conn.Close(); err != nil {
		log.Printf("something happened trying to close the connection: %v", err)
	}
	c.Hub.Disconnect <- c
}

func (c *Client) validRead(err error) error {
	if websocket.IsCloseError(err, websocket.CloseNormalClosure) {
		log.Printf("client %v disconnected", c.Id)
	} else if websocket.IsCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
		log.Printf("client %v lost connection", c.Id)
	} else {
		log.Printf("an unexpected error occurred: %v", err)
	}
	return err
}
