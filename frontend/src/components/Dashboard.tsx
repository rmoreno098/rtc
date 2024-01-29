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
        <div>
            <h1>Dashboard</h1>
            <div>
                <p>Logged in as {pb!.authStore!.model!.username}</p>
                <div className="chats">
                    <ChatBox />
                </div>
                <br />
                <button onClick={handleLogout}>Logout</button>
            </div>
        </div> 
    );
};

export default Dashboard;