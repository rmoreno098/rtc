import React, { useState, FormEvent, ChangeEvent } from "react";
import pb from "../pocketbase";
import { useNavigate, Link } from "react-router-dom";

interface FormData {
  username: string;
  password: string;
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [loginError, setError] = useState<string>("");
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
      setError(error.message);
      // alert("Error logging in! please contact administator");
      return;
    }
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-full max-w-xs">
        <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4" onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Username
            </label>
            <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="username"
              name="username"
              type="text" 
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}/>
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Password
            </label>
            <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
              id="password" 
              name="password"
              type="password" 
              placeholder="******************"
              value={formData.password}
              onChange={handleChange}/>
          </div>
          <div className="flex items-center justify-between">
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
              Sign In
            </button>
            <Link className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" to="/signup">
              Sign Up 
            </Link>
            {/* <Link className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800" to="/signup">
              Forgot Password?
            </Link> */}
          </div>
          {loginError && ( <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 my-3 rounded relative" role="alert">
            <strong className="font-bold">{loginError}</strong>
            <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
              <button onClick={()=>setError("")}>
                <span className="text-2xl">&times;</span>
              </button>
            </span>
          </div>)}
        </form>
      </div>
    </div>
  );
};

export default Home;
