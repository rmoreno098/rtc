import { useEffect, useRef, useState } from "react";
import { Message } from "./models";
import { initializeConnection, sendMessage } from "./actions";

export default function ChatBox() {
  const ws = useRef<WebSocket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");

  useEffect(() => {
    if (ws != null) {
      initializeConnection(ws, setMessages);
    }
    return () => {
      ws.current?.close();
    };
  }, []);

  return (
    <div className="h-screen w-full flex flex-col bg-gray-100">
      {/* Header */}
      <header className="p-4 bg-white shadow-md text-center">
        <h1 className="text-2xl font-semibold text-gray-800">Chat</h1>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
        {messages.map((message, index) => (
          <div
            key={index}
            className="flex flex-col max-w-xl p-3 rounded-lg bg-white shadow-md"
          >
            <span className="text-xs text-gray-500 mb-1">
              User {message.id}
            </span>
            <span className="text-gray-800">{message.message}</span>
          </div>
        ))}
      </main>

      {/* Input */}
      <footer className="p-4 bg-white border-t shadow-md">
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(ws, input, setInput);
          }}
        >
          <input
            type="text"
            className="flex-1 px-4 py-2 border rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
          />
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-full transition"
          >
            Send
          </button>
        </form>
      </footer>
    </div>
  );
}
