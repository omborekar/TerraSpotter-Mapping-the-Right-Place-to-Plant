import React, { useEffect, useState } from "react";
import axios from "axios";
import LoadingSpinner from "./ui/LoadingSpinner";

const BASE_URL = import.meta.env.VITE_API_URL;

const AdminPendingLands = () => {

  const [lands, setLands] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔥 FETCH USER FROM COOKIE
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/auth/session`, {
          withCredentials: true
        });

        console.log("SESSION USER 👉", res.data);
        setUser(res.data);

      } catch (err) {
        console.error("Session error:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, []);

  // ⏳ LOADING
  if (loading) {
    return <LoadingSpinner text="Loading..." />;
  }

  // 🔐 ROLE CHECK
  if (!user?.role) {
    return <div className="text-center mt-10">No session ❌</div>;
  }

  if (user.role !== "ADMIN") {
    return (
      <div className="text-center mt-10 text-red-500">
        Access Denied 🚫
      </div>
    );
  }

  // 📥 FETCH LANDS
  const fetchLands = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/lands/pending`, {
        withCredentials: true
      });
      setLands(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user?.role === "ADMIN") {
      fetchLands();
    }
  }, [user]);

  // ✅ VOTE
  const handleVote = async (landId, vote) => {
    try {
      await axios.post(
        `${BASE_URL}/lands/${landId}/verify`,
        null,
        {
          withCredentials: true,
          params: {
            vote: vote,
            userId: user.id
          }
        }
      );

      fetchLands();
    } catch (err) {
      console.error(err);
      alert("Error voting");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Pending Lands Review 🧠
      </h1>

      {lands.length === 0 ? (
        <p>No pending lands 😌</p>
      ) : (
        <div className="grid gap-4">
          {lands.map((land) => (
            <div key={land.id} className="border p-4 rounded shadow">

              <h2 className="text-lg font-semibold">{land.title}</h2>
              <p>📍 {land.location}</p>
              <p>🌱 Area: {land.areaSqm} sqm</p>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleVote(land.id, "APPROVE")}
                  className="bg-green-500 text-white px-3 py-1 rounded"
                >
                  ✅ Approve
                </button>

                <button
                  onClick={() => handleVote(land.id, "REJECT")}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  ❌ Reject
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPendingLands;