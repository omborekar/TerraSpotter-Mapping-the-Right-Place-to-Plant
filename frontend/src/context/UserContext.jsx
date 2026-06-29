import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

const BASE_URL = import.meta.env.VITE_API_URL;

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [xpData, setXpData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSession = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/auth/session`, {
        withCredentials: true,
      });
      setUser(res.data);
      if (res.data) {
        try {
          const xp = await axios.get(`${BASE_URL}/api/gamification/me`, { withCredentials: true });
          setXpData(xp.data);
        } catch {
          setXpData(null);
        }
      } else {
        setXpData(null);
      }
    } catch (err) {
      // 401 is expected if not logged in, so we don't log it as an error
      if (err.response?.status !== 401) {
        console.error("Session verification failed:", err.message);
      }
      setUser(null);
      setXpData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Warm up backend and ML API on application load
    axios.get(`${BASE_URL}/api/auth/`, { withCredentials: true }).catch(() => {});
    fetchSession();
  }, []);

  const logout = async () => {
    try {
      await axios.post(`${BASE_URL}/api/auth/logout`, {}, { withCredentials: true });
      setUser(null);
      setXpData(null);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const login = (userData) => {
    setUser(userData);
    fetchSession(); // Refresh to get XP etc
  };

  return (
    <UserContext.Provider value={{ user, xpData, setUser, loading, logout, login, refreshUser: fetchSession }}>
      {children}
    </UserContext.Provider>
  );
};
