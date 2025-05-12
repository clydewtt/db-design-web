import React, { useState } from "react";
import Dither from "../../Dither";
import "./index.scss";

const Upload = () => {
  const [image, setImage] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!image || !title || !description || !category) {
      alert("Please fill out all fields and upload an image.");
      return;
    }
  
    const fileInput = document.querySelector("input[type='file']");
    const file = fileInput.files[0];
  
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("image", file);
    formData.append("user_id", localStorage.getItem("token"));
  
    try {
      const res = await fetch("http://localhost:8000/artwork/upload", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // If using JWT
        },
      });
  
      const data = await res.json();
  
      if (res.ok) {
        alert("Artwork uploaded successfully!");
        // Optionally reset fields or redirect
      } else {
        alert(data.detail || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("An error occurred while uploading.");
    }
  };
  

  return (
    <>
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

      <div className="upload-container">
        <h1>Upload Artwork</h1>

        <form className="upload-form" onSubmit={handleSubmit}>
          {/* Left Column: Image */}
          <label className="image-upload">
            {image ? (
              <img src={image} alt="Artwork preview" />
            ) : (
              <div className="upload-placeholder">
                <span>＋</span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              hidden
            />
          </label>

          {/* Right Column: Text Fields */}
          <div className="form-details">
            <input
              type="text"
              placeholder="Art Title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              placeholder="Write artwork description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Category</option>
              <option value="digital-illustration">Digital Illustration</option>
              <option value="ai-art">AI Art</option>
              <option value="3d-modeling">3D Modeling</option>
              <option value="photography">Photography</option>
              <option value="mixed-media">Mixed Media</option>
              <option value="other">Other</option>

            </select>
          </div>
        </form>

        <button type="submit" className="submit-btn" onClick={handleSubmit}>
          Save Submission
        </button>
      </div>
    </>
  );
};

export default Upload;
