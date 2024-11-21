"use client";

import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import apiClient from "../../lib/apiClient";
import { ProfileData } from "../../interfaces/profile";
import { useAuth } from "../../contexts/AuthContext";

const ProfilePage = () => {
  const { isAuthenticated, logout } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData>({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    date_of_birth: "",
    phone_number: null,
    address: "",
    city: null,
    state: null,
    country: null,
    zip_code: null,
    bio: "",
    organization: { id: 0, name: "" },
    tier: { tier_name: "" },
    date_joined: "",
    last_login: null,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await apiClient.get<ProfileData>("/profile");
        setProfileData(data);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };

    fetchProfile();
  }, []);

  return (
    <div className="h-screen bg-gray-100 flex flex-col items-center py-8 px-4">
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-2xl">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Profile</h2>
          <button
            onClick={logout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>

        {/* Profile Details */}
        <div className="mt-6 space-y-4">
          {/* Render fields as per the interface */}
          <div>
            <label className="block text-sm font-semibold text-gray-600">
              First Name
            </label>
            <input
              type="text"
              value={profileData.first_name}
              readOnly
              className="w-full px-4 py-2 border border-transparent rounded bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600">
              Last Name
            </label>
            <input
              type="text"
              value={profileData.last_name}
              readOnly
              className="w-full px-4 py-2 border border-transparent rounded bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600">
              Username
            </label>
            <input
              type="text"
              value={profileData.username}
              readOnly
              className="w-full px-4 py-2 border border-transparent rounded bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600">
              Email
            </label>
            <input
              type="email"
              value={profileData.email}
              readOnly
              className="w-full px-4 py-2 border border-transparent rounded bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600">
              Organization
            </label>
            <input
              type="text"
              value={profileData.organization.name}
              readOnly
              className="w-full px-4 py-2 border border-transparent rounded bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600">
              Tier
            </label>
            <input
              type="text"
              value={profileData.tier.tier_name}
              readOnly
              className="w-full px-4 py-2 border border-transparent rounded bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600">
              Date Joined
            </label>
            <input
              type="text"
              value={new Date(profileData.date_joined).toLocaleDateString()}
              readOnly
              className="w-full px-4 py-2 border border-transparent rounded bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600">
              Last Login
            </label>
            <input
              type="text"
              value={
                profileData.last_login
                  ? new Date(profileData.last_login).toLocaleDateString()
                  : "Never"
              }
              readOnly
              className="w-full px-4 py-2 border border-transparent rounded bg-gray-100"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
