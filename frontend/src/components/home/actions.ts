import pb from "../../pocketbase";
import { Message } from "./models";

const websocketURL = `ws://localhost:8090/api/rtc/connect?token=`;
const websocketProtocol = "c_id";
const userToken = pb.authStore.token;
const userId = pb.authStore.record!.id;

export const initializeConnection = async (
  websocket: React.MutableRefObject<WebSocket | null>,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  setMessage: React.Dispatch<React.SetStateAction<null | string>>
) => {
  websocket.current = new WebSocket(websocketURL, [websocketProtocol, userId]);

  websocket.current.onopen = () => {
    console.log("connected to server");
  };

  websocket.current.onmessage = (event) => {
    setMessages((prev) => [...prev, JSON.parse(event.data)]);
  };

  websocket.current.onclose = (e) => {
    console.error(e);
    setMessage("connection to server closed");
  };
};

export const sendMessage = (
  websocket: React.MutableRefObject<WebSocket | null>,
  input: string,
  setInput: React.Dispatch<React.SetStateAction<string>>
) => {
  try {
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
  } catch (err) {
    console.log("look:", err);
  }
};

export const handleLogout = async (socket: WebSocket | null) => {
  if (socket) {
    socket.close();
  }

  pb.authStore.clear();
  alert("Successfully logged out!");
};
