import pb from "../../pocketbase";
import { Message } from "./models";

const websocketURL = "ws://localhost:8090/api/rtc/connect";
const websocketProtocol = "c_id";
const userId = pb.authStore.record!.id;

export const initializeConnection = async (
  websocket: React.MutableRefObject<WebSocket | null>,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
) => {
  websocket.current = new WebSocket(websocketURL, [websocketProtocol, userId]);

  websocket.current.onopen = () => {
    console.log("connected to server");
  };

  websocket.current.onmessage = (event) => {
    setMessages((prev) => [...prev, JSON.parse(event.data)]);
  };

  websocket.current.onclose = () => {
    alert("unable to connect to server, refresh page to try again.");
  };
};

export const sendMessage = (
  websocket: React.MutableRefObject<WebSocket | null>,
  input: string,
  setInput: React.Dispatch<React.SetStateAction<string>>
) => {
  if (input !== "" && websocket.current) {
    const data = JSON.stringify({
      id: userId,
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
