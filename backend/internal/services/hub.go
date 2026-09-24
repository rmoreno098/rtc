package services

import (
	"log"
	"sync"
)

type Hub struct {
	Mu         sync.Mutex       // allow safe access to client map
	Clients    map[*Client]bool // map holding active clients
	Inbound    chan *Client     // connection request
	Broadcast  chan []byte      // message coming from a client
	Disconnect chan *Client     // disconnects a client
}

func NewHub() *Hub {
	hub := &Hub{
		Mu:         sync.Mutex{},
		Clients:    make(map[*Client]bool),
		Inbound:    make(chan *Client),
		Broadcast:  make(chan []byte),
		Disconnect: make(chan *Client),
	}
	go hub.run()
	return hub
}

func (h *Hub) run() {
	for {
		select {
		// new connection received
		case client := <-h.Inbound:
			h.Mu.Lock()
			h.Clients[client] = true
			log.Printf("client %v has connected to the server", client.Id)
			h.Mu.Unlock()
		// message received from other clients
		case msg := <-h.Broadcast:
			h.Mu.Lock()
			for client := range h.Clients {
				select {
				case client.Outbound <- msg:
				default: // client channel not open
					close(client.Outbound)
					delete(h.Clients, client)
				}
			}
			h.Mu.Unlock()
		// disconnect a client
		case client := <-h.Disconnect:
			h.Mu.Lock()
			if _, ok := h.Clients[client]; ok {
				close(client.Outbound)
				delete(h.Clients, client)
				log.Printf("closed connection for client %v", client.Id)
			}
			h.Mu.Unlock()
		}
	}
}
