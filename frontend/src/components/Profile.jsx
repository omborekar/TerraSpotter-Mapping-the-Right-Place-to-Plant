import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [editData, setEditData] = useState({
    fname: "",
    lname: "",
    phoneNo: "",
  });
  const [editOpen, setEditOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ================= FETCH PROFILE =================
  useEffect(() => {
    fetch("http://localhost:8080/api/users/profile", {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Not authenticated");
        return res.json();
      })
      .then((data) => {
        setProfile(data);
        setEditData({
          fname: data.fname,
          lname: data.lname,
          phoneNo: data.phoneNo,
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load profile");
        setLoading(false);
      });
  }, []);

  // ================= UPDATE PROFILE =================
  const handleSave = async () => {
    try {
      const response = await fetch(
        "http://localhost:8080/api/users/profile",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(editData),
        }
      );

      if (!response.ok) throw new Error("Update failed");

      const updatedUser = await response.json();

      setProfile(updatedUser);
      setEditOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg font-medium">Loading profile...</p>
      </div>
    );

  if (error || !profile)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg font-medium text-red-600">
          {error || "Profile not available"}
        </p>
      </div>
    );

  return (
    <main className="min-h-screen bg-gray-100 px-6 py-10">
      <div className="max-w-5xl mx-auto space-y-10">

        {/* PROFILE HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow p-6 flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-bold">
              {profile.fname} {profile.lname}
            </h1>
            <p className="text-gray-600">{profile.email}</p>
            <p className="text-gray-600">{profile.phoneNo}</p>
          </div>

          <button
            onClick={() => setEditOpen(true)}
            className="px-5 py-2 bg-green-700 text-white rounded hover:bg-green-800"
          >
            Edit Profile
          </button>
        </motion.div>

        {/* BASIC INFO CARD */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            Personal Details
          </h2>

          <div className="space-y-2 text-gray-700">
            <p><strong>Date of Birth:</strong> {profile.dob}</p>
            <p><strong>User ID:</strong> {profile.id}</p>
          </div>
        </div>
      </div>

      {/* EDIT MODAL */}
      <AnimatePresence>
        {editOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-xl p-6 w-full max-w-md"
            >
              <h3 className="text-lg font-semibold mb-4">
                Edit Profile
              </h3>

              <input
                className="w-full border p-2 rounded mb-3"
                value={editData.fname}
                onChange={(e) =>
                  setEditData({ ...editData, fname: e.target.value })
                }
                placeholder="First Name"
              />

              <input
                className="w-full border p-2 rounded mb-3"
                value={editData.lname}
                onChange={(e) =>
                  setEditData({ ...editData, lname: e.target.value })
                }
                placeholder="Last Name"
              />

              <input
                className="w-full border p-2 rounded mb-3"
                value={editData.phoneNo}
                onChange={(e) =>
                  setEditData({ ...editData, phoneNo: e.target.value })
                }
                placeholder="Phone Number"
              />

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setEditOpen(false)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-green-700 text-white rounded"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};

export default Profile;
