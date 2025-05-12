import React, { useState } from "react";
import Balatro from "../../Balatro";
import ReactLogo from "../../assets/react.svg";
import { Heart, Bookmark } from "lucide-react";
import axios from "axios";
import "./index.scss";

const Artwork = ({ title, username, description, image, id, userID, liked: initialLiked, favorited: initialFavorited, like_count }) => {
  const [flipped, setFlipped] = useState(false);
  const [liked, setLiked] = useState(initialLiked);
  const [favorited, setFavorited] = useState(initialFavorited);
  const [likeCount, setLikeCount] = useState(like_count);

  const toggleLike = async () => {
    try {
      await axios.post(`http://localhost:8000/artwork/${id}/like`, {
        user_id: userID,
      });
      setLiked(!liked);
      setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
    } catch (err) {
      console.error("Failed to like artwork", err);
    }
  };

  const toggleFavorite = async () => {
    try {
      await axios.post(`http://localhost:8000/artwork/${id}/favorite`, {
        user_id: userID,
      });
      setFavorited(!favorited);
    } catch (err) {
      console.error("Failed to favorite artwork", err);
    }
  };

  return (
    <div className="center-wrapper">
      <div className="main-content">
        <div
          className={`flip-card ${flipped ? "flipped" : ""}`}
          onClick={() => setFlipped(!flipped)}
        >
          <div className="flip-card-inner">
            <div className="flip-card-front">
              <img src={image} alt={title} />
            </div>
            <div className="flip-card-back">
              <div className="back-content">
                <h2>{title}</h2>
                <p>{description}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-content">
          <h2 className="art-title">{title}</h2>
          <p className="artist-tag">{username}</p>
          <div className="art-actions">
            <div onClick={toggleLike} className="icon">
              <Heart
                size={20}
                strokeWidth={1.8}
                fill={liked ? "#ff4f81" : "none"}
                color={liked ? "#ff4f81" : "#aaa"}
              />
              <span>{likeCount}</span>
            </div>
            <div onClick={toggleFavorite} className="icon">
              <Bookmark
                size={20}
                fill={favorited ? "#00bfff" : "none"}
                color={favorited ? "#00bfff" : "#aaa"}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Artwork;
