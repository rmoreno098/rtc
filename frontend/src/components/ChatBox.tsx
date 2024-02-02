import { useEffect, useState } from "react";
import pb from "../pocketbase";

interface Message {
    username: string;
    message: string;
}

const ChatBox = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [messageInput, setMessageInput] = useState<string>("");
    const [socket, setSocket] = useState<WebSocket | null>(null);
    // const [connected, setConnected] = useState(false);

    useEffect(() => {
        const socket = new WebSocket("ws://127.0.0.1:8080/rtc");

        socket.addEventListener('open', () => {
            console.log("Connected to server");
        });

        socket.addEventListener('message', (event: MessageEvent) => {
            console.log("raw data", event.data)
            const data = JSON.parse(event.data);
            setMessages((prevMessages) => [...prevMessages, data])
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
                username: pb!.authStore!.model!.username,
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
                            <span>{message.username + ":"}</span>
                            <span>{message.message}</span>
                        </li>
                    ))} 
                </ul>
            }
            <input 
                type="text" 
                placeholder="Enter message"
                onChange={(e) => messageHandler(e)}
            />
            <button 
                onClick={sendMessage}>
                Send
            </button>
        </div>
    )
};

export default ChatBox;