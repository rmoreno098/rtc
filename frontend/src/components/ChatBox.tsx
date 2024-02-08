import { useEffect, useState } from "react";
import pb from "../pocketbase";

interface Message {
    type: string;
    id: string;
    message: string;
}

const ChatBox = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [messageInput, setMessageInput] = useState<string>("");
    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        const socket = new WebSocket(`ws://127.0.0.1:8080/rtc?id=${pb!.authStore!.model!.username}`);

        socket.addEventListener('open', () => {
            console.log("Connected to server");
        });

        socket.addEventListener('message', (event: MessageEvent) => {
            console.log("raw data", event.data);
            const data = JSON.parse(event.data);
            if (data.type === "message") {
                setMessages((prevMessages) => [...prevMessages, data]) 
            }
        });

        socket.addEventListener("close", () => {
            console.log("Disconnected from server");
        });

        setSocket(socket);

        return () => {
            if(socket) {
                socket.close();
            }
        };
    }, []);

    const sendMessage = () => {
        if(messageInput !== "" && socket) {
            const data = JSON.stringify({
                type: "message",
                message: messageInput
            });
            socket.send(data);
            setMessageInput("");
        }
    }

    const messageHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        setMessageInput(e.currentTarget.value);
    }

    console.log(messages);

    return (
        <div>
            <h1>Chat Room</h1>
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
            <input 
                type="text" 
                placeholder="Enter message"
                onChange={(e) => messageHandler(e)}
                value={messageInput}
            />
            <button 
                onClick={sendMessage}>
                Send
            </button>
        </div>
    )
};

export default ChatBox;