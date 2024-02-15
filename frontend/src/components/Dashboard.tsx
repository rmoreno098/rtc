import pb from "../pocketbase";
import { useNavigate } from "react-router-dom";
import ChatBox from "./ChatBox";

const Dashboard = () => {  
    const navigate = useNavigate();

    const handleLogout = async () => {
        pb.authStore.clear(); // clears storage (essentially logging user out)
        alert("Successfully logged out!");
        navigate("/");
    }

    return (
        <div className="flex items-center justify-center">
             <div className="">
                <h1>Dashboard</h1>
                <p>Logged in as {pb!.authStore!.model!.username}</p>
                <div className="chats">
                    <ChatBox />
                </div>
                <br />
                <button
                    className="flex-shrink-0 bg-red-500 hover:bg-red-700 border-red-500 hover:border-red-700 text-sm border-4 text-white py-1 px-2 rounded-full"
                    onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </div> 
    );
};

export default Dashboard;