package main

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"sync"

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

	app.OnBeforeServe().Add(func(e *core.ServeEvent) error {
		e.Router.GET("/api/check_map", echo.HandlerFunc(func(c echo.Context) error {
			var x []MapResponse
			for client := range clients {
				x = append(x, MapResponse{ID: client.id})
			}
			return c.JSON(http.StatusOK, x)
		}))
		return nil
	})

    // create api route
    app.OnBeforeServe().Add(func(e *core.ServeEvent) error {
        e.Router.GET("/api/rtc", echo.HandlerFunc(handleWebsocket))
        return nil
    })

    // start the server
    if err := app.Start(); err != nil {
        log.Fatal(err)
    }
}

// map of clients and a mutex lock to handle concurrent access
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

type MapResponse struct {
	ID string `json:"id"`
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
        log.Println("Error upgrading connection:", err)
        return err
    }

    // create a new client
	// TODO: secure the client id (e.g validate it, pass it as a header, etc.)
    client := &Client{
        conn: conn,
		send: make(chan []byte), 
        id: c.Request().URL.Query().Get("id"),
	}
    
    // safely add the client to the map
    clientMux.Lock()
    clients[client] = true
    clientMux.Unlock()

    // send to frontend map of clients
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
	message := Message{
		Type: "status", 
		Message: strings.Join(onlineUsers, ", "),
	}
	message_to_bytes, err := json.Marshal(message)
	if err != nil {
		log.Println("Error converting status message for clients:", err)
		return
	}

    // send out the message
	for client := range clients {
		if err := client.conn.WriteMessage(websocket.TextMessage, message_to_bytes); err != nil {
			log.Println("Error sending status message to clients:", err)
		}
	}
}

// function to read new messages from the client
func (c *Client) read() {
	defer func() {
		closeConnection(c)
	} ()

	if c.conn == nil {
		return
	}

	for {
		var received Message
		err := c.conn.ReadJSON(&received)
		if err != nil {
			if err == io.EOF {
				log.Println("Client disconnected")
			} else {
				log.Println("Error reading message from client:", err)
			}
			return 
		}

		received.ID = c.id
		broadcastMessages(received)
	}
}

// function to send messages to the client
func (c *Client) write() {
	defer func() {
		closeConnection(c)
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

// function to handle client disconnection
func closeConnection(c *Client) {
	clientMux.Lock()
	delete(clients, c)
	log.Println("look here", clients)
	c.conn.Close()
	clientMux.Unlock()
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