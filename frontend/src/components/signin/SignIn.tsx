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
    if (await signin(formData, setError)) {
      navigate("/home");
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-layout">
        <section className="auth-intro">
          <a className="brand" href="/">
            <span className="brand-mark">R</span>
            real time chat
          </a>
          <div className="intro-copy">
            <h1>Make space for the good stuff.</h1>
          </div>
          <div className="intro-note" />
        </section>
        <section className="auth-panel">
          <p className="eyebrow">Welcome back</p>
          <h2>Sign in</h2>
          <p className="panel-subtitle">Pick up where you left off.</p>
          <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="auth-form">
          <div className="field">
            <label htmlFor="username">Username or email</label>
            <input
              type="text"
              name="username"
              id="username"
              placeholder="username or email"
              value={formData.username}
              onChange={handleChange}
              required
              className=""
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              name="password"
              id="password"
              placeholder="********"
              value={formData.password}
              onChange={handleChange}
              required
              className=""
            />
          </div>
          {loginError && (
            <div className="form-error" role="alert">{loginError}</div>
          )}
          <button type="submit" className="primary-button">Sign in</button>
          </form>
          <p className="auth-switch">New here? <Link to="/signup">Create an account</Link></p>
        </section>
      </div>
    </main>
  );
}
