// LoginForm.tsx
import React, { useState, FormEvent, ChangeEvent } from 'react';
import pb from '../pocketbase';
import { Link } from 'react-router-dom';

interface FormData {
  username: string;
  password: string;
}

const Home: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    username: '',
    password: '',
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
    const authData = await pb.collection('users').authWithPassword(formData.username, formData.password);

    console.log(pb.authStore.isValid);
    console.log(authData);
  }

  return (
    <div>
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

        <a>
            <Link to="/signup">Signup</Link>
        </a>
    </div>
  );
};

export default Home;
