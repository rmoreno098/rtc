import { useState, ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FormData } from "./models";
import { signin } from "./actions";

export default function SignIn() {
  const navigate = useNavigate();
  const [loginError, setError] = useState<string>("");
  const [formData, setFormData] = useState<FormData>({
    username: "",
    password: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    await signin(formData, setError);
    navigate("/home");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-700 px-4">
      <div className="w-full max-w-sm bg-white rounded-lg shadow-md p-6">
        <h1 className="text-center text-3xl font-semibold text-slate-800 mb-6">
          <span className="text-blue-600 font-bold">R</span>eal{" "}
          <span className="text-green-600 font-bold">T</span>ime{" "}
          <span className="text-red-500 font-bold">C</span>hat
        </h1>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="space-y-5"
        >
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Username
            </label>
            <input
              type="text"
              name="username"
              id="username"
              placeholder="username or email"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              placeholder="********"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex justify-between items-center">
            <Link
              to="/signup"
              className="text-sm text-green-600 hover:text-green-800 font-medium"
            >
              Sign Up
            </Link>
            <button
              type="submit"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Sign In
            </button>
          </div>

          {loginError && (
            <div
              className="relative bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"
              role="alert"
            >
              <strong className="font-semibold">Error:</strong> {loginError}
              <button
                onClick={() => setError("")}
                className="absolute top-1 right-2 text-xl leading-none text-red-500 hover:text-red-700"
                aria-label="Close"
              >
                &times;
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
