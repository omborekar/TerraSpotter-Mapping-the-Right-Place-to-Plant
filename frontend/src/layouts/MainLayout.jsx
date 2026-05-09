import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ChatUI from "../components/ChatUI";
import { useUser } from "../context/UserContext";

const MainLayout = () => {
  const { user } = useUser();
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-emerald-500/30">
      <Navbar />
      
      <main className="flex-grow">
        <Outlet />
      </main>

      {user && <ChatUI />}
      
      <Footer />
    </div>
  );
};

export default MainLayout;
