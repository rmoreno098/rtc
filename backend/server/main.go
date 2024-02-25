package main

import (
	"log"
	"sync"
	// "strings"
	"net/http"
	"encoding/json"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader {
	ReadBufferSize: 1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool { return true },	// Allow any origin
}

type Client struct {
	conn *websocket.Conn
	id string
	send chan []byte
}

type Message struct {
	Type    string `json:"type"`
	ID      string `json:"id"`
	Message string `json:"message"`
}

var (
	clients = make(map[*Client]bool)
	clientMux = &sync.Mutex{}
)

func handleWebsocket(w http.ResponseWriter, r *http.Request) {
	log.Println("Websocket connection established!")
	conn, err := upgrader.Upgrade(w, r, nil) 
	if err != nil {
		log.Println(err)
		return
	}

	client := &Client{conn: conn, send: make(chan []byte), id: r.URL.Query().Get("id")}

	clientMux.Lock()
	clients[client] = true
	clientMux.Unlock()

	log.Println("Client connected!", client.conn.RemoteAddr())
	// broadcastConnectedUsersMessage()

	go client.read()
	go client.write()
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
		log.Println("Received", received.Type, "from client ", received.ID, ":", received.Message)
		// broadcastConnectedUsersMessage()
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

// func broadcastConnectedUsersMessage() {
// 	var connected_users []string
// 	for client := range clients {
// 		connected_users = append(connected_users, client.id)
// 	}

// 	clientMux.Lock()
// 	defer clientMux.Unlock()
// 	connectedUsersString := strings.Join(connected_users, ", ")
// 	message := Message{Type: "connected_users", Message: "Connected users: " + connectedUsersString}
// 	broadcastMessages(message)
// }

func main() {
	http.HandleFunc("/rtc", handleWebsocket)	
	log.Println("Listening on port 8080!")
	http.ListenAndServe(":8080", nil)
}