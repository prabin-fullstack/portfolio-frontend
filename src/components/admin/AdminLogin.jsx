import { useState } from "react";
import "../../style/admin/AdminLogin.css";
import api from "../../api";
import {useNavigate, Link} from 'react-router-dom'

export default function AdminLogin({ onSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | checking | error
  const [error, setError] = useState("");
  const navigate = useNavigate()

  
  const submit = async (e) => {
  e.preventDefault();
  if (!username || !password) return;

  setStatus("checking");
  setError("");

  try {
    const response = await api.post("/token/", { username, password });
    const { access, refresh } = response.data;

    localStorage.setItem("access_token", access);
    if (refresh) localStorage.setItem("refresh_token", refresh);

    onSuccess?.();
    navigate("/dashboard");
  } catch (err) {
    console.log(err);
    const status_code = err.response?.status;
    if (status_code === 401 || status_code === 400) {
      setError("Incorrect username or password.");
    } else {
      setError("Couldn't reach the server — try again.");
    }
    setStatus("error");
  }
};

  return (
    <div className="admin-login">
      <div className="admin-login__grid" aria-hidden="true" />

      <Link to="/" className="admin-login__back">
        <span className="admin-login__back-arrow" aria-hidden="true">←</span>
        Back to home
      </Link>

      <div className="admin-login__card">
        <div className="admin-login__mark">P.</div>

        <span className="admin-login__eyebrow">Admin — Secure access</span>
        <h1 className="admin-login__title">Sign in</h1>
        <p className="admin-login__desc">Content editor for Prabin.O — portfolio</p>

        <form onSubmit={submit} className="admin-login__form">
          <div className="admin-login__field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
            />
          </div>

          <div className="admin-login__field">
            <label htmlFor="password">Password</label>
            <div className="admin-login__password-row">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="admin-login__toggle-visibility"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {error && (
            <p className="admin-login__error" role="alert">
              <span className="admin-login__error-dot" aria-hidden="true" />
              {error}
            </p>
          )}

          <button
            type="submit"
            className="admin-login__submit"
            disabled={status === "checking" || !username || !password}
          >
            {status === "checking" ? "Checking…" : "Sign in"}
          </button>
        </form>

        <p className="admin-login__log">
          <span className="admin-login__log-cursor" aria-hidden="true" />
          {status === "checking"
            ? "verifying credentials"
            : status === "error"
              ? "access denied — retry"
              : "awaiting credentials"}
        </p>
      </div>
    </div>
  );
}