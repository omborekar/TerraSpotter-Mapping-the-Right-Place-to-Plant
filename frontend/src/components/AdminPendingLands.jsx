import React, { useEffect, useState } from "react";
import axios from "axios";
import LoadingSpinner from "./ui/LoadingSpinner";

const AdminPendingLands = ({ currentUser }) => {

  const [lands, setLands] = useState([]);
    console.log("currentUser:", currentUser);
  // 🔐 Role check
if (!currentUser?.role) {
  return <LoadingSpinner text="Loading..." />;
}

if (currentUser.role !== "ADMIN") {
  return (
    <div className="text-center mt-10 text-red-500">
      Access Denied 🚫
    </div>
  );
}
    console.log("currentUser:", currentUser);

  // 📥 fetch pending lands
  const fetchLands = async () => {
    try {
      const res = await axios.get("http://localhost:8080/lands/pending");
      setLands(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLands();
  }, []);

  // ✅ vote handler
  const handleVote = async (landId, vote) => {
    try {
      await axios.post(
        `http://localhost:8080/lands/${landId}/verify`,
        null,
        {
          params: {
            vote: vote,
            userId: currentUser.id
          }
        }
      );

      fetchLands(); // refresh
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
            <div
              key={land.id}
              className="border p-4 rounded shadow"
            >
              <h2 className="text-lg font-semibold">
                {land.title}
              </h2>

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