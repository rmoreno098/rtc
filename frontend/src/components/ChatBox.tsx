import { useEffect, useState } from "react";
import pb from "../pocketbase";

interface Message {
  type: string;
  id: string;
  message: string;
}

interface Props {
  onConnectedUsersUpdate: (users: string) => void; // Define the type of the prop
}

const ChatBox: React.FC<Props> = ({ onConnectedUsersUpdate }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<string>("");
  const [messageInput, setMessageInput] = useState<string>("");
  const [websocket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket(
      `ws://127.0.0.1:8090/rtc?id=${pb!.authStore!.model!.username}`
    );

    socket.addEventListener("open", () => {
      console.log("Connected to server");
    });

    socket.addEventListener("message", (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "message") {
          setMessages((prevMessages) => [...prevMessages, data]);
        } else if (data.type === "status") {
          console.log("here", data.message);
          setUsers(data.message);
          onConnectedUsersUpdate(data.message);
        } else {
          console.log("Received message type:", data.type);
          console.log(data.message);
        }
      } catch (error) {
        console.log("Error parsing message:", error);
      }
    });

    socket.addEventListener("close", () => {
      console.log("Disconnected from server");
    });

    setSocket(socket);

    return () => {
      socket.close();
    };
  }, []);


  const sendMessage = () => {
    if (messageInput !== "" && websocket) {
      const data = JSON.stringify({
        type: "message",
        message: messageInput,
      });
      websocket.send(data);
      setMessageInput("");
    }
  };

  const messageHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setMessageInput(e.currentTarget.value);
  };

  console.log(messages);
  console.log(users);

  return (
    <div className="h-screen flex flex-col my-2">
      <h1 id="title" className="justify-center self-center text-2xl">
        Chat
      </h1>
      <div id="user-chats-display" className="flex-grow overflow-auto mx-6">
        {
          <ul>
            {messages.map((message, index) => (
              <li key={index}>
                <span>{message.id + ": "}</span>
                <span>{message.message}</span>
              </li>
            ))}
          </ul>
        }
      </div>
      <div className="border-t border-black py-2 px-6">
        <div
          id="chat-input"
          className="flex items-center border-b border-green-500 py-2"
        >
          <input
            className="appearance-none bg-transparent text-gray-700 border-none w-full mr-3 py-1 px-2 rounded leading-tight"
            id="message-box"
            type="text"
            placeholder="Enter message"
            onChange={(e) => messageHandler(e)}
            value={messageInput}
          />
          <button
            className="flex-shrink-0 bg-green-500 hover:bg-green-700 border-green-500 hover:border-green-700 text-sm border-4 text-white py-1 px-2 rounded-full"
            type="button"
            onClick={sendMessage}
          >
            Send
          </button>

        </div>
      </div>
    </div>
  );
};

export default ChatBox;
