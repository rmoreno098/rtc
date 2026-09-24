import { useState, ChangeEvent, FormEvent } from "react";
import { Link } from "react-router-dom";
import { signup } from "./actions";
import { FormData } from "./models";

export default function SignUp() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    signup(formData);
  };

  const fields = [
    { label: "Name", name: "name", type: "text" },
    { label: "Username", name: "username", type: "text" },
    { label: "Email", name: "email", type: "email" },
    { label: "Password", name: "password", type: "password" },
    { label: "Confirm Password", name: "confirmPassword", type: "password" },
  ];

  return (
    <main className="auth-page">
      <div className="auth-layout">
        <section className="auth-intro">
          <a className="brand" href="/">
            <span className="brand-mark">R</span>
            real time chat
          </a>
          <div className="intro-copy">
            <div className="intro-kicker">A quieter room for conversation</div>
            <h1>Your next conversation starts here.</h1>
            <p>Make a room for the people and ideas you want to keep close.</p>
          </div>
          <div className="intro-note" />
        </section>
        <section className="auth-panel">
          <p className="eyebrow">Join the room</p>
          <h2>Create your account</h2>
          <p className="panel-subtitle">A few details, then you are in.</p>
        <form onSubmit={handleSubmit} className="auth-form">
          {fields.map(({ label, name, type }) => (
            <div key={name} className="field">
              <label htmlFor={name}>{label}</label>
              <input
                type={type}
                name={name}
                id={name}
                value={(formData as FormData)[name]}
                onChange={handleChange}
                required
                className=""
              />
            </div>
          ))}
          <button type="submit" className="primary-button">Create account</button>
        </form>
        <p className="auth-switch">Already have an account? <Link to="/">Sign in</Link></p>
        </section>
      </div>
    </main>
  );
}
