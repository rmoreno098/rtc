import React, { useState } from "react";
import ChatBox from "./ChatBox";
import Modal from "../public/Modal";

export default function Home() {
  const [message, setMessage] = useState<null | string>(null);

  return (
    <div className="flex justify-center items-center h-screen bg-gray-200">
      <div className="w-full max-w-4xl h-full">
        <ChatBox setModalMessage={setMessage} />
      </div>
      {message && <Modal message={message} />}
    </div>
  );
}
