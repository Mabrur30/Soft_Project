import { useState } from "react";
import Navbar from "../components/common/Navbar.jsx";
import Hero from "../components/home/Hero.jsx";
import Features from "../components/home/Features.jsx";
import Stats from "../components/home/Stats.jsx";
import CTA from "../components/home/CTA.jsx";
import LoginModal from "../components/auth/LoginModal.jsx";
import Footer from "../components/common/Footer.jsx";

export default function HomePage() {
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <>
      <Navbar onLoginClick={() => setLoginOpen(true)} />
      <Hero onGetStarted={() => setLoginOpen(true)} />
      <Features />
      <Stats />
      <CTA onClick={() => setLoginOpen(true)} />
      <Footer /> {/* ← add this */}
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}
