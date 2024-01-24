import React, { useState, FormEvent, ChangeEvent } from "react";
import pb from "../pocketbase";
import { useNavigate, Link } from "react-router-dom";

interface FormData {
  username: string;
  password: string;
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    username: "",
    password: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    signin();
  };

  async function signin() {
    try {
        const authData = await pb
        .collection("users")
        .authWithPassword(formData.username, formData.password);

        if (pb.authStore.isValid) {
            console.log("Logged in!", authData);
            navigate("/dashboard");
          } else {
              alert("Failed to autheticate!");
          }
    } catch (error) {
        alert("Error logging in!, please contact administator");
        console.log(error);
        return;
    }
  }

  return (
    <div>
      <h1>Real Time Chat Application</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Username:
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
          />
        </label>
        <br />
        <label>
          Password:
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
        </label>
        <br />
        <button type="submit">Login</button>
      </form>
      <Link to="/signup">Signup</Link>
    </div>
  );
};

export default Home;
