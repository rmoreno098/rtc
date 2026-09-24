import { useState } from "react";
import ChatBox from "./ChatBox";
import Modal from "../public/Modal";

export default function Home() {
  const [message, setMessage] = useState<null | string>(null);

  return (
    <div className="chat-page">
      <ChatBox setModalMessage={setMessage} />
      {message && <Modal message={message} />}
    </div>
  );
}
