package main

import (
	"log"
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
)

func handleWebsocket(w http.ResponseWriter, r *http.Request) {
	log.Println("Websocket connection established!")
	conn, err := upgrader.Upgrade(w, r, nil) 
	if err != nil {
		log.Println(err)
		return
	}

	client := &Client{conn: conn, send: make(chan []byte), id: r.URL.Query().Get("id")}
	clients[client] = true

	log.Println("Client connected!", client.conn.RemoteAddr())

	go client.read()
	go client.write()
}

func (c *Client) read() {
	defer func() {
		c.conn.Close()
	} ()
	for {
		var received Message
		// _, p, err := c.conn.ReadMessage()
		err := c.conn.ReadJSON(&received)
		if err != nil {
			log.Println(err)
			return
		}

		received.ID = c.id
		log.Println("Received", received.Type, "from client ", received.ID, ":", received.Message)
		broadcast(received)
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
			// c.conn.WriteMessage(websocket.TextMessage, append([]byte(c.id), message...))
			c.conn.WriteMessage(websocket.TextMessage, message)
			// c.conn.WriteJSON(message)
		}
	}
}

func broadcast(message Message) {
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

func main() {
	http.HandleFunc("/rtc", handleWebsocket)	
	log.Println("Listening on port 8080!")
	http.ListenAndServe(":8080", nil)
}