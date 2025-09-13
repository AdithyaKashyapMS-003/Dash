import React from "react";

import { useTranslation } from "react-i18next";

import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Help from "./pages/Help";
import Home from "./pages/Home";
import Solutions from "./pages/Solutions";
import Guides from "./pages/Guides";
import Community from "./pages/Community";
import FarmerDashboard from "./pages/FarmerDashboard";
import AdminUpload from "./pages/AdminUpload";
import MarketPlace from "./pages/MarketPlace";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/Signin";
import AiChat from "./pages/Ai-chat";
import RentalUpload from "./pages/RentalUpload";
import Rent from "./pages/rent";
import Weather from "./pages/Weather";


function App() {
  // Initialize the translation hook
  const { t, i18n } = useTranslation();

  // Function to handle language changes
  const handleLanguageChange = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Gradient Layer */}
        <div className="absolute inset-0 bg-gradient-to-b from-green-100 via-green-50 to-white"></div>

        {/* Wavy Animated Fields */}
        <div className="absolute bottom-0 left-0 w-full h-64 overflow-hidden">
          <svg
            className="absolute bottom-0 w-[200%] h-full animate-wave-slow opacity-70"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 320"
            preserveAspectRatio="none"
          >
            <path
              fill="#86efac"
              fillOpacity="0.7"
              d="M0,256L40,245.3C80,235,160,213,240,202.7C320,192,400,192,480,197.3C560,203,640,213,720,224C800,235,880,245,960,229.3C1040,213,1120,171,1200,165.3C1280,160,1360,192,1400,208L1440,224L1440,320L0,320Z"
            ></path>
          </svg>
          <svg
            className="absolute bottom-0 w-[200%] h-full animate-wave-fast opacity-60"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 320"
            preserveAspectRatio="none"
          >
            <path
              fill="#4ade80"
              fillOpacity="0.6"
              d="M0,288L60,272C120,256,240,224,360,202.7C480,181,600,171,720,165.3C840,160,960,160,1080,176C1200,192,1320,224,1380,240L1440,256L1440,320L0,320Z"
            ></path>
          </svg>
        </div>
      </div>

      {/* Foreground Content */}
      <Navbar />
      <main className="flex-1 relative z-10">
        <Routes>
          <Route path="/help" element={<Help />} />
          <Route path="/" element={<Home />} />
          <Route path="/solutions" element={<Solutions />} />
          <Route path="/guides" element={<Guides />} />
          <Route path="/community" element={<Community />} />
          <Route path="/dashboard" element={<FarmerDashboard />} />
          <Route path="/admin-upload" element={<AdminUpload />} />
          <Route path="/market-place" element={<MarketPlace />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/ai-chat" element={<AiChat />} />
          <Route path="/marketplace/upload" element={<RentalUpload />} />
          <Route path="/marketplace/rent" element={<Rent />} />
          <Route path="/weather" element={<Weather />} />
        </Routes>
      </main>
      <Footer />

      {/* Tailwind CSS Animations */}
      <style>
        {`
          @keyframes wave-slow {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          @keyframes wave-fast {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-wave-slow { animation: wave-slow 20s linear infinite; }
          .animate-wave-fast { animation: wave-fast 10s linear infinite; }
        `}
      </style>
    </div>
  );
}


export default App;

