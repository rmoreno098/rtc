package internal

import (
	"log"
	"sync"
)

type Hub struct {
	mu         sync.Mutex       // allow safe access to client map
	clients    map[*Client]bool // map holding active clients
	inbound    chan *Client     // connection request
	broadcast  chan []Message   // message coming from a client
	disconnect chan *Client     // disconnects a client
}

func NewHub() *Hub {
	hub := &Hub{
		mu:        sync.Mutex{},
		clients:   make(map[*Client]bool),
		inbound:   make(chan *Client),
		broadcast: make(chan []Message),
	}
	go hub.run()
	return hub
}

func (h *Hub) run() {
	for {
		select {
		// new connection received
		case client := <-h.inbound:
			h.mu.Lock()
			h.clients[client] = true
			log.Printf("client %v has connected to the server", client.id)
			h.mu.Unlock()
		// message received from other clients
		case msg := <-h.broadcast:
			h.mu.Lock()
			for client := range h.clients {
				select {
				case client.outbound <- msg:
				default: // client channel not open
					close(client.outbound)
					delete(h.clients, client)
				}
			}
		// disconnect a client
		case client := <-h.disconnect:
			close(h.inbound)
			close(h.broadcast)
			delete(h.clients, client)
			log.Printf("closed connection for client %v", client.id)
		}
	}
}
