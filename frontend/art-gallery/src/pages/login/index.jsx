import React, { useState, useEffect } from "react";
import axios from "axios";
import "./index.css";
import Dither from "../../Dither";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/browse");
    }
  }, []);
  

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:8000/auth/login", {
        email,
        password,
      });

      toast.success("🎉 Login successful!");
      console.log("User ID:", response.data.user_id);
      localStorage.setItem("token", response.data.user_id);
      navigate("/browse"); // Redirect to the browse page

      // Redirect or handle token here if needed
    } catch (err) {
      if (err.response) {
        toast.error(`❌ ${err.response.data.detail || "Login failed"}`);
      } else {
        toast.error("❌ Network error");
      }
    }
  };

  return (
    <div className="login-wrapper">
      <div className="background">
        <Dither
          waveColor={[0.5, 0.5, 0.5]}
          disableAnimation={false}
          enableMouseInteraction={true}
          mouseRadius={0.3}
          colorNum={5}
          waveAmplitude={0.35}
          waveFrequency={3}
          waveSpeed={0.05}
        />
      </div>

      <div className="login-container">
        <div className="login-box">
          <h2>Sign in to your account</h2>
          <p>Enter an unforgettable experience</p>

          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <p className="error-text">{error}</p>}
            {success && <p className="success-text">{success}</p>}
            <p className="register-text">
              Don't have an account? <a href="/register">Register</a>
            </p>
            <button type="submit">LOG IN</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
