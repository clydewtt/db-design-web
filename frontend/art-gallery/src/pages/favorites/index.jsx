import React, { useEffect, useState } from "react";
import InfiniteMenu from "../../blocks/Components/InfiniteMenu/InfiniteMenu.jsx";
import axios from "axios";

const Favorites = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const userID = localStorage.getItem("token");
    if (!userID) return;

    const fetchFavorites = async () => {
      try {
        const res = await axios.get("http://localhost:8000/artwork/favorites", {
          params: { user_id: userID }
        });

        console.log(res)

        const formatted = res.data.map((art) => ({
          image: art.image_url,
          link: art.image_url,
          title: art.title,
          description: art.description || "No description"
        }));

        setItems(formatted);
      } catch (err) {
        console.error("Failed to fetch favorites", err);
      }
    };

    fetchFavorites();
  }, []);

  return (
    <div style={{ height: '100vh', position: 'relative' }}>
      <InfiniteMenu items={items} />
    </div>
  );
};

export default Favorites;
