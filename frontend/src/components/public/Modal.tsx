import { useState, useEffect } from "react";

type ModalProps = {
  message: string;
};

export default function Modal({ message }: ModalProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`fixed bottom-8 left-8 p-4 rounded-lg shadow-xl text-white max-w-xs transition-all duration-500 ease-in-out transform
        ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
        }
        ${message.startsWith("⚠️") ? "bg-red-500" : "bg-green-500"}
        z-50`}
    >
      <div className="flex items-center">
        <p className="font-semibold text-sm leading-tight">{message}</p>
      </div>
    </div>
  );
}
