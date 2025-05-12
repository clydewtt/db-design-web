import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import Login from "./pages/login";
import Signup from "./pages/signup";
import Browse from "./pages/browse";
import Upload from "./pages/upload";
import Favorites from "./pages/favorites";
import Profile from "./pages/profile";
import "./App.css";
import MetallicPaint, {
  parseLogoImage,
} from "./blocks/Animations/MetallicPaint/MetallicPaint.jsx";
import logo from "./assets/logo2.svg";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Menu overlay as separate component so it can access useNavigate
const MenuOverlay = ({ onClose }) => {
  const navigate = useNavigate();
  const menuRef = useRef();

  const handleNav = (path) => {
    navigate(path);
    onClose();
  };

  const handleSignout = () => {
    localStorage.clear();
    navigate("/login");
    onClose();
  };

  // ✅ Detect clicks outside of the menu content
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div className="menu-overlay fade-in">
      <div className="menu-items" ref={menuRef}>
        <h2>MENU</h2>
        <ul>
          <li onClick={() => handleNav("/upload")}>UPLOAD</li>
          <li onClick={() => handleNav("/browse")}>BROWSE</li>
          <li onClick={() => handleNav("/favorites")}>FAVORITES</li>
          <li onClick={() => handleNav("/profile")}>PROFILE</li>
          <li className="sign-out" onClick={handleSignout}>
            SIGN OUT
          </li>
        </ul>
      </div>
    </div>
  );
};

const AppContent = () => {
  const [imageData, setImageData] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const isLoggedIn = !!localStorage.getItem("token");

  const ProtectedRoute = ({ children }) => {
    const isLoggedIn = !!localStorage.getItem("token");
    return isLoggedIn ? children : <Navigate to="/login" replace />;
  };

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

  const toggleMenu = () => {
    if (menuOpen) {
      setMenuOpen(false);
      setTimeout(() => setMenuVisible(false), 300); // wait for fade-out
    } else {
      setMenuVisible(true);
      setTimeout(() => setMenuOpen(true), 10); // trigger fade-in
    }
  };

  const handleLogoClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleMenu();
  };

  const routes = useMemo(
    () => (
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Signup />} />

        <Route
          path="/browse"
          element={
            <ProtectedRoute>
              <Browse />
            </ProtectedRoute>
          }
        />
        <Route
          path="/upload"
          element={
            <ProtectedRoute>
              <Upload />
            </ProtectedRoute>
          }
        />
        <Route
          path="/favorites"
          element={
            <ProtectedRoute>
              <Favorites />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Routes>
    ),
    [isLoggedIn]
  ); // Only recreate routes if login status changes

  return (
    <>
      <div className="logo" onClick={handleLogoClick}>
        <MetallicPaint
          imageData={imageData ?? new ImageData(1, 1)}
          params={{
            edge: 0,
            patternBlur: 0.005,
            patternScale: 2,
            refraction: 0.05,
            speed: 0.5,
            liquid: 0.07,
          }}
        />
      </div>

      {menuVisible && isLoggedIn && (
        <div
          className={`menu-overlay ${menuOpen ? "fade-in" : "fade-out"}`}
          onAnimationEnd={() => {
            if (!menuOpen) setMenuVisible(false);
          }}
        >
          <MenuOverlay onClose={toggleMenu} />
        </div>
      )}

      {routes}
    </>
  );
};

const App = () => (
  <Router>
    <ToastContainer
      position="top-right"
      autoClose={4000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="dark" // ✅ Enables dark mode
    />{" "}
    <AppContent />
  </Router>
);

export default App;
