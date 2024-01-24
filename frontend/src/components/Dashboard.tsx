import pb from "../pocketbase";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {  
    const navigate = useNavigate();

    const handleLogout = async () => {
        pb.authStore.clear(); // clears storage (essentially logging user out)
        navigate("/");
    }

    return (
        <div>
            <h1>Dashboard</h1>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
};

export default Dashboard;