import React, { useEffect, useRef, useState } from "react";
import { Message } from "./models";
import { initializeConnection, sendMessage } from "./actions";
import pb from "../../pocketbase";

type ChatBoxProps = {
  setModalMessage: React.Dispatch<React.SetStateAction<null | string>>;
};

export default function ChatBox({ setModalMessage }: ChatBoxProps) {
  const ws = useRef<WebSocket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const currentUserId = pb.authStore.record?.id;

  useEffect(() => {
    if (ws.current) {
      return;
    } else {
      initializeConnection(ws, setMessages, setModalMessage);
    }
    return () => {
      ws.current?.close();
      ws.current = null;
    };
  }, []);

  return (
    <div className="chat-shell">
      <aside className="chat-sidebar">
        <a className="brand" href="/"><span className="brand-mark">R</span>real time chat</a>
        <div className="sidebar-caption">Your rooms</div>
        <div className="room-item"><span className="room-dot" /> Lounge <span style={{ marginLeft: "auto", color: "#89cbd0" }}>01</span></div>
      </aside>
      <section className="chat-main">
        <header className="chat-header">
          <div><h1 className="chat-title">Lounge</h1><div className="chat-status"><span className="status-dot" /> Live room</div></div>
          <div className="chat-status">{messages.length} {messages.length === 1 ? "message" : "messages"}</div>
        </header>
        <main className="messages">
          {messages.length === 0 ? <div className="empty-state"><div className="empty-icon">R</div><h2>The room is quiet.</h2><p>Start the conversation with a thought, a question, or a simple hello.</p></div> : messages.map((message, index) => (
            <div key={index} className={`message-row ${message.id === currentUserId ? "is-mine" : ""}`}>
              <div className="message-bubble"><span className="message-author">{message.id === currentUserId ? "You" : `User ${message.id.slice(0, 6)}`}</span><span className="message-text">{message.message}</span></div>
            </div>
          ))}
        </main>
        <footer className="composer">
        <form
          className="composer-form"
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(ws, input, setInput);
          }}
        >
          <input
            type="text"
            className="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
          />
          <button type="submit" className="send-button">Send</button>
        </form>
      </footer>
      </section>
    </div>
  );
}
