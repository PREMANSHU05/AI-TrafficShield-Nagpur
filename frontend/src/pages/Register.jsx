import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../api";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm((currentForm) => ({
      ...currentForm,
      [event.target.name]: event.target.value,
    }));
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await axios.post("/api/auth/register", form);
      navigate("/login", {
        state: { message: "Registration successful. Please log in." },
      });
    } catch (requestError) {
      setError(requestError.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Register</h1>
        <p>Create a TrafficShield police account.</p>

        <form onSubmit={handleRegister}>
          <label htmlFor="name">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            placeholder="Your full name"
            required
          />

          <label htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            type="text"
            value={form.username}
            onChange={handleChange}
            placeholder="Choose a username"
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Choose a password"
            minLength="6"
            required
          />

          {error && (
            <p className="login-error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="auth-link">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
