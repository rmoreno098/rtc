package main

import (
	"log"
	"os"
	"sync"
	"strings"
    "net/http"
    "encoding/json"
    "github.com/gorilla/websocket"
	"github.com/labstack/echo/v5"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
)

func main() {
    // start new pocketbase instance
    app := pocketbase.New()

    // serves static files from the provided public dir (if exists)
    app.OnBeforeServe().Add(func(e *core.ServeEvent) error {
        e.Router.GET("/*", apis.StaticDirectoryHandler(os.DirFS("./pb_public"), false))
        return nil
    })

    // create api route
    app.OnBeforeServe().Add(func(e *core.ServeEvent) error {
        e.Router.GET("/rtc", echo.HandlerFunc(handleWebsocket))
        return nil
    })

    // start the server
    if err := app.Start(); err != nil {
        log.Fatal(err)
    }
}

// cretae a map of clients and a mutex to handle concurrent access
var (
	clients = make(map[*Client]bool)
	clientMux = &sync.Mutex{}
)

// Message struct
type Message struct {
	Type    string `json:"type"`
	ID      string `json:"id"`
	Message string `json:"message"`
}

// Client struct
type Client struct {
	conn *websocket.Conn
	id string
	send chan []byte
}

// function called when a new websocket connection is made
func handleWebsocket(c echo.Context) error {

    // upgrade the http connection to a websocket connection
    upgrader := websocket.Upgrader {
        ReadBufferSize: 1024,
        WriteBufferSize: 1024,
        CheckOrigin: func(r *http.Request) bool { return true },	// Allow any origin
    }

    conn, err := upgrader.Upgrade(c.Response(), c.Request(), nil)
    if err != nil {
        log.Println(err)
        return err
    }

    // create a new client
    client := &Client{
        conn: conn, send: make(chan []byte), 
        id: c.Request().URL.Query().Get("id")}
    
    // safely add the client to the map
    clientMux.Lock()
    clients[client] = true
    clientMux.Unlock()

    log.Println("Client connected!", client.conn.RemoteAddr())

    // send a message to all clients with the updated list of online users
	onlinePresence()

    // start the read and write goroutines
    go client.read()
    go client.write()

    return nil
}

// function to send a message to all clients with the updated list of online users
func onlinePresence() {
	var onlineUsers []string

    // safely get the list of online users
	clientMux.Lock()
	for client := range clients {
		onlineUsers = append(onlineUsers, client.id)
	}
	clientMux.Unlock()

    // create a message with the updated list of online users
	message := Message{Type: "status", Message: strings.Join(onlineUsers, ", ")}
	message_to_bytes, err := json.Marshal(message)
	if err != nil {
		log.Println(err)
		return
	}

    // send out the message
	for client := range clients {
		if err := client.conn.WriteMessage(websocket.TextMessage, message_to_bytes); err != nil {
			log.Println(err)
		}
	}
}

// function to read new messages from the client
func (c *Client) read() {
	defer func() {
		c.conn.Close()
	} ()
	for {
		var received Message
		err := c.conn.ReadJSON(&received)
		if err != nil {
			log.Println(err)
			return
		}

		received.ID = c.id
		broadcastMessages(received)
	}
}

// function to send messages to the client
func (c *Client) write() {
	defer func() {
		c.conn.Close()
	} ()
	for {
		select {
		case message, ok := <-c.send:
			if !ok {
				return
			}
			log.Println(c.id, "said:", string(message))
			c.conn.WriteMessage(websocket.TextMessage, message)
		}
	}
}

// function to broadcast messages to all clients
func broadcastMessages(message Message) {
	message_to_bytes, err := json.Marshal(message)
	if err != nil {
		log.Println(err)
		return
	}

	for client := range clients {
		select {
		case client.send <- message_to_bytes:
		default:
			close(client.send)
			delete(clients, client)
		}
	}
}