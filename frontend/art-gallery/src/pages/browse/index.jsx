import React, { useEffect, useState, useRef } from "react";
import Artwork from "../../components/artwork";
import Balatro from "../../Balatro";
import "./index.scss";
import CommentsPanel from "../../components/comments";
import MetallicPaint, {
  parseLogoImage,
} from "../../blocks/Animations/MetallicPaint/MetallicPaint.jsx";
import axios from "axios";

import logo from "../../assets/logo3.svg";

const DEFAULT_BG_COLOR = ["#DE443B", "#006BB4", "#162325"];

const Browse = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [artworks, setArtworks] = useState([]);
  const sectionRefs = useRef([]);
  const scrollRef = useRef(null);
  const currentUserId = localStorage.getItem("token");

  const [imageData, setImageData] = useState(null);

  useEffect(() => {
    async function loadDefaultImage() {
      try {
        const response = await fetch(logo);
        const blob = await response.blob();
        const file = new File([blob], "default.png", { type: blob.type });

        const parsedData = await parseLogoImage(file);
        setImageData(parsedData?.imageData ?? null);
      } catch (err) {
        console.error("Error loading default image:", err);
      }
    }

    loadDefaultImage();
  }, []);

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const res = await axios.get("http://localhost:8000/artwork/all", {
          params: { user_id: currentUserId },
        });
        setArtworks(res.data);
      } catch (err) {
        console.error("Failed to fetch artworks:", err);
      }
    };

    fetchArtworks();
  }, []);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollY = container.scrollTop;
      const height = window.innerHeight;
      const index = Math.floor(scrollY / height);

      setActiveIndex((prev) => (prev !== index ? index : prev));
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    console.log("activeIndex changed:", activeIndex);
  }, [activeIndex]);

  console.log("activeIndex:", activeIndex, artworks[activeIndex]);

  return (
    <div className="browse-wrapper" ref={scrollRef}>
      {/* Background stays fixed */}
      <div className="background">
        <Balatro
          color1={
            artworks[activeIndex]?.gradient_colors?.[0] ?? DEFAULT_BG_COLOR[0]
          }
          color2={
            artworks[activeIndex]?.gradient_colors?.[1] ?? DEFAULT_BG_COLOR[1]
          }
          color3={
            artworks[activeIndex]?.gradient_colors?.[2] ?? DEFAULT_BG_COLOR[2]
          }
          mouseInteraction={false}
          pixelFilter={2000}
          spinRotation={-0.5}
        />
      </div>

      {/* These will scroll on the window/document */}
      {artworks.map((art, i) => (
        <div
          key={art.id}
          className="artwork-container"
          ref={(el) => (sectionRefs.current[i] = el)}
        >
          <Artwork
            title={art.title}
            username={art.username}
            image={art.image_url}
            description={art.description}
            id={art.id}
            userID={currentUserId}
            like_count={art.like_count}
            liked={art.liked}
            favorited={art.favorited}
          />
        </div>
      ))}

      <CommentsPanel
        artID={artworks[activeIndex]?.id ?? 0}
        userID={currentUserId}
      />
    </div>
  );
};

export default Browse;
