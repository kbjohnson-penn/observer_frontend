"use client";

import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

const LoginPage = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      await login(username, password);
      window.location.href = "/dashboard"; // Redirect after login
    } catch {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="h-screen bg-slate-50 flex justify-center md:items-center md:px-4">
      <div className="bg-white shadow-lg rounded-md w-full max-w-md mt-4 md:mt-0">
        {/* Header */}
        <div className="bg-blue-900 text-white py-6 px-4 md:px-8 rounded-t-md text-center">
          <img
            src="/ObserverLogoDarkBackground.svg"
            alt="Penn Logo"
            className="mx-auto w-20 md:w-24 mb-2"
          />
          <h2 className="text-lg md:text-xl font-semibold">
            Login to Repository
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-4 py-6 space-y-4 md:px-8">
          {error && <p className="text-red-500 text-sm">{error}</p>}

          {/* Username */}
          <div>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Password */}
          <div>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Show Password Checkbox */}
          <div className="flex items-center space-x-2">
            <input
              id="show-password"
              type="checkbox"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
              className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label
              htmlFor="show-password"
              className="text-sm text-gray-600 cursor-pointer"
            >
              Show Password
            </label>
          </div>

          {/* Submit Button */}
          <div>
            <input
              type="submit"
              value="Log in"
              className="w-full bg-blue-900 text-white font-semibold py-2 rounded hover:bg-blue-800 transition"
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
