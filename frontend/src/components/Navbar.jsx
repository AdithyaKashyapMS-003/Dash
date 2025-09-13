// Navbar.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaLeaf, FaSeedling } from "react-icons/fa";
import { useTranslation } from "react-i18next";

function Navbar() {
  const { isSignedIn } = useAuth();
  const { t, i18n } = useTranslation();

  const [show, setShow] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY) {
        // scrolling down
        setShow(false);
      } else {
        // scrolling up
        setShow(true);
      }
      setLastScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const handleLanguageChange = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 bg-green-100 border-b-2 border-green-300 shadow-lg transition-transform duration-300 ${
        show ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="flex justify-between items-center py-4 px-6 sm:px-8 lg:px-12">
        {/* Left-side: Logo + Dashboard/Market */}
        <div className="flex items-center space-x-6">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center text-2xl font-bold text-green-900 leading-none cursor-pointer"
          >
            <FaSeedling className="mr-2 text-green-700 animate-bounce" />
            AgriGrow
          </Link>

          {/* Dashboard & Market */}
          <Link
            className="text-green-700 font-medium hover:text-green-900 transition"
            to="/dashboard"
          >
            {t("nav_dashboard")}
          </Link>
          <Link
            className="text-green-700 font-medium hover:text-green-900 transition"
            to="/market-place"
          >
            {t("nav_market_place")}
          </Link>
          <Link
            className="text-green-700 font-medium hover:text-green-900 transition"
            to="/admin-upload"
          >
            Admin Upload
          </Link>
        </div>

        {/* Language Selector */}
        <div>
          <select
            onChange={handleLanguageChange}
            value={i18n.language}
            className="bg-gray-100 border-2 border-gray-300 rounded-md p-1 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
            <option value="kn">ಕನ್ನಡ</option>
            <option value="te">తెలుగు</option>
            <option value="ta">தமிழ்</option>
          </select>
        </div>

        {/* Right-side: Main Links + Sign Up */}
        <div className="flex items-center space-x-8 sm:space-x-10">
          <Link
            className="text-green-800 font-medium hover:text-green-900 transition"
            to="/solutions"
          >
            {t("nav_solutions")}
          </Link>
          <Link
            className="text-green-800 font-medium hover:text-green-900 transition"
            to="/guides"
          >
            {t("nav_guides")}
          </Link>
          <Link
            className="text-green-800 font-medium hover:text-green-900 transition"
            to="/community"
          >
            {t("nav_community")}
          </Link>
          <Link
            className="text-green-800 font-medium hover:text-green-900 transition"
            to="/help"
          >
            {t("nav_help")}
          </Link>

          {/* Sign Up button */}
          {!isSignedIn && (
            <Link
              to="/signup"
              className="py-2 px-5 border border-green-600 rounded-full text-green-800 font-semibold hover:bg-green-200 transition flex items-center gap-1"
            >
              <FaLeaf /> {t("signup_button")}
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
