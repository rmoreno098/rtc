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
    app := pocketbase.New()

    // serves static files from the provided public dir (if exists)
    app.OnBeforeServe().Add(func(e *core.ServeEvent) error {
        e.Router.GET("/*", apis.StaticDirectoryHandler(os.DirFS("./pb_public"), false))
        return nil
    })

    app.OnBeforeServe().Add(func(e *core.ServeEvent) error {
        e.Router.GET("/rtc", echo.HandlerFunc(handleWebsocket))
        return nil
    })

    if err := app.Start(); err != nil {
        log.Fatal(err)
    }
}

var (
	clients = make(map[*Client]bool)
	clientMux = &sync.Mutex{}
)

type Message struct {
	Type    string `json:"type"`
	ID      string `json:"id"`
	Message string `json:"message"`
}

type Client struct {
	conn *websocket.Conn
	id string
	send chan []byte
}

func handleWebsocket(c echo.Context) error {

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

    client := &Client{conn: conn, send: make(chan []byte), id: c.Request().URL.Query().Get("id")}
    
    clientMux.Lock()
    clients[client] = true
    clientMux.Unlock()

    log.Println("Client connected!", client.conn.RemoteAddr())

	onlinePresence()

    go client.read()
    go client.write()

    return nil
}

func onlinePresence() {
	var onlineUsers []string
	clientMux.Lock()
	for client := range clients {
		onlineUsers = append(onlineUsers, client.id)
	}
	clientMux.Unlock()

	message := Message{Type: "status", Message: strings.Join(onlineUsers, ", ")}
	message_to_bytes, err := json.Marshal(message)
	if err != nil {
		log.Println(err)
		return
	}

	for client := range clients {
		if err := client.conn.WriteMessage(websocket.TextMessage, message_to_bytes); err != nil {
			log.Println(err)
		}
	}
}

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