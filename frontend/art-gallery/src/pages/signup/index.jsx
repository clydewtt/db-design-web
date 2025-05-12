import React, { useState, useEffect } from "react";
import "./index.css";
import Dither from "../../Dither";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/browse");
    }
  }, []);
  

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8000/auth/signup", formData); // Adjust base URL if needed
      alert("Signup successful!");
      // Redirect to login or dashboard here
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.detail || "Signup failed");
    }
  };

  return (
    <div className="signup-wrapper">
      <div className="dither-background">
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

      <div className="signup-container">
        <div className="signup-box">
          <h2>Create an account</h2>
          <p>Enter an unforgettable experience</p>

          <form className="signup-form" onSubmit={handleSubmit}>
            <div className="input-pair">
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-pair">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <p className="login-text">
              Already have an account? <a href="/login">Login</a>
            </p>

            <button type="submit">SIGN UP</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
