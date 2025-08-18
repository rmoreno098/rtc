import pb from "../../pocketbase";
import { Message } from "./models";

const websocketURL = "ws://localhost:8090/api/rtc/connect";

export const initializeConnection = async (
  websocket: React.MutableRefObject<WebSocket | null>,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
) => {
  websocket.current = new WebSocket(websocketURL);

  websocket.current.onopen = () => {
    console.log("connected to server");
  };

  websocket.current.onmessage = (event) => {
    setMessages((prev) => [...prev, event.data]);
  };

  websocket.current.onclose = () => {
    console.log("disconnected from server");
  };
};

export const sendMessage = (
  websocket: React.MutableRefObject<WebSocket | null>,
  input: string,
  setInput: React.Dispatch<React.SetStateAction<string>>
) => {
  if (input !== "" && websocket.current) {
    const data = JSON.stringify({
      id: "",
      type: "message",
      message: input,
    });
    websocket.current.send(data);
    setInput("");

    console.log("sent message", data);
  }
};

export const handleLogout = async (socket: WebSocket | null) => {
  if (socket) {
    socket.close();
  }
  pb.authStore.clear();
  alert("Successfully logged out!");
};
