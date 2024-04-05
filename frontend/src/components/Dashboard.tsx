import pb from "../pocketbase";
import ChatBox from "./ChatBox";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [connectedUsers, setConnectedUsers] = useState<string[]>([]);

  const handleLogout = async () => {
    pb.authStore.clear(); // clears storage (essentially logging user out)
    alert("Successfully logged out!");
    navigate("/");
  };

  const handleConnectedUsersUpdate = (users: string) => {
    // console.log("users", users);
    const temp = users.split(",");
    const usersFiltered = [...new Set(temp)];
    setConnectedUsers(usersFiltered);
  };

  return (
    <div className="flex flex-col h-screen min-h-screen">
      <nav className="flex justify-between items-center bg-gray-800 h-[5%] w-full px-4">
        <h1 className="text-white">welcome {pb!.authStore!.model!.username}</h1>
        <ul className="flex">
          <li className="ml-6 text-sm text-white">
            <button
              className="flex-shrink-0 bg-red-500 hover:bg-red-700 border-red-500 hover:border-red-700 text-sm border-4 text-white mx-1 my-1 py-1 px-2 rounded-full"
              onClick={handleLogout}
            >
              Logout
            </button>
          </li>
        </ul>
      </nav>
      <div className="flex flex-1 max-h-[95%]">
        <div
          id="chat-box"
          className="flex relative flex-col w-full bg-white max-w-[90%]"
        >
          <ChatBox onConnectedUsersUpdate={handleConnectedUsersUpdate} />
        </div>
        <div
          id="active-users"
          className="box-border flex relative flex-col ml-auto bg-white max-w-[10%] size-full border-l border-black items-center"
        >
          <h1 className="text-center underline">Online Users</h1>
          <div className="mx-2">
            <ul>
                {connectedUsers.map((user, index) => (
                <li key={index} className="p-1">
                  <button className="border rounded" onClick={() => {console.log("i was clicked")}}>
                    {user}
                  </button>
                </li>
                ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
