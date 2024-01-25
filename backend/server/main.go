package main

import (
	"log"

	"net/http"
	"golang.org/x/net/websocket"
)

type Server struct {
	conns map[*websocket.Conn]bool
}

func NewServer() *Server {
	return &Server{
		conns: make(map[*websocket.Conn]bool),
	}
}

func (s *Server) AddConn(conn *websocket.Conn) {
	s.conns[conn] = true
	log.Println("New connection added", conn.RemoteAddr())

	s.connectionPool(conn)
}

func (s *Server) connectionPool(conn *websocket.Conn) {
	for {
		buffer := make([]byte, 1024)
		bytes_read, err := conn.Read(buffer)	// read message into buffer
		if err != nil {
			if err.Error() == "EOF" {
				log.Println("Connection closed", conn.RemoteAddr())
				break
			}
			log.Println("Error receiving message", err)
			continue
		}

		msg := buffer[:bytes_read]
		log.Println("Message received:", string(msg))
		s.Broadcast(msg)
	}
}

func (s *Server) Broadcast(msg []byte) {
	for conn := range s.conns {
		if _, err := conn.Write(msg); err != nil {
			log.Println("Error sending message to connection", err)
		}
	}
}

func main() {
	server := NewServer()
	http.Handle("/rtc", websocket.Handler(server.AddConn))
	
	log.Println("Listening on port 8080!")
	http.ListenAndServe(":8080", nil)
}