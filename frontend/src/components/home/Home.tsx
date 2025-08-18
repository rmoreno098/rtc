import ChatBox from "./ChatBox";

export default function Home() {
  return (
    <div className="flex justify-center items-center h-screen bg-gray-200">
      <div className="w-full max-w-4xl h-full">
        <ChatBox />
      </div>
    </div>
  );
}
