import { useState } from "react";
import axios from "../api";
import { Link, useLocation, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post(
        "/api/auth/login",
        {
          username,
          password,
        },
      );

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      navigate("/");
    } catch (error) {
      setError(error.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>🚦 AI-TrafficShield</h1>
        <p>Traffic Control System</p>

        {location.state?.message && (
          <p className="login-success" role="status">
            {location.state.message}
          </p>
        )}

        <form onSubmit={handleLogin}>
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
            required
          />

          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            required
          />

          {error && <p className="login-error">{error}</p>}

          <button type="submit">Login</button>
        </form>

        <p className="auth-link">
          Need an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
