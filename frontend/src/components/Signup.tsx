import React, { useState, FormEvent, ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import pb from '../pocketbase';

interface FormData {
  name: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const Signup: React.FC = () => {
    const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
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

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }

    signup();
  };

  async function signup() {
    try {
        const record = await pb.collection('users').create(
            {
                "username" : formData.username,
                "email" : formData.email,
                "emailVisibility" : true,
                "password" : formData.password,
                "passwordConfirm" : formData.confirmPassword,
                "name" : formData.name,
            }
        )
        console.log("Signed up!", record)
        alert("Signed up successfully!");
        navigate("/");
    } catch (error) {
        alert("Error signing up!, please contact administator");
        console.log(error);
        return;
    }
    // await pb.collection('users').requestVerification(formData.email);    // email confirmation
  }

  return (
    <div>
        <h1>Signup for RTC !</h1>
        <form onSubmit={handleSubmit}>
        <label>
            Name:
            <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            />
        </label>
        <br />
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
            Email:
            <input
            type="email"
            name="email"
            value={formData.email}
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
        <label>
            Confirm Password:
            <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            />
        </label>
        <br />
        <button type="submit">Sign Up</button>
        </form>
        <Link to="/">Login</Link>
    </div>
  );
};

export default Signup;
