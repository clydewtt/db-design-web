import React, { useState, useEffect } from "react";
import axios from "axios";
import Squares from "../../blocks/Backgrounds/Squares/Squares.jsx";
import "./index.scss";

const Profile = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const userId = localStorage.getItem("token");
    if (!userId) return;

    axios
      .get(`http://localhost:8000/users/${userId}`)
      .then((res) => {
        const { username, email } = res.data;
        setUsername(username);
        setEmail(email);
      })
      .catch((err) => {
        console.error("Failed to load user data", err);
      });
  }, []);

  const handleUpdate = async () => {
    try {
      const userId = localStorage.getItem("token"); // adjust if your token format is different

      await axios.put(`http://localhost:8000/users/${userId}`, {
        username,
        email,
        password,
      });

      alert("Profile updated!");
    } catch (error) {
      console.error("Update failed", error);
      alert("Something went wrong updating your profile.");
    }
  };

  return (
    <div className="profile-page">
      <div className="background">
        <Squares
          speed={0.5}
          squareSize={30}
          direction="diagonal" // up, down, left, right, diagonal
            borderColor="#222"
          hoverFillColor="#222"
        />
      </div>
      <div className="profile-card">
        <img
          src="https://thumbs.dreamstime.com/b/default-profile-picture-avatar-photo-placeholder-vector-illustration-default-profile-picture-avatar-photo-placeholder-vector-189495158.jpg"
          alt="Profile"
          className="profile-img"
        />
        <h2>Your Profile</h2>

        <div className="form-group">
          <label>Username</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button className="update-btn" onClick={handleUpdate}>
          Update
        </button>
      </div>
    </div>
  );
};

export default Profile;
