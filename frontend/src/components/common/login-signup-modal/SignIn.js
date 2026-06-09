"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { adminLogin } from "@/api/adminLogin";

const SignIn = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await adminLogin(email, password);
      if (res.status === "success") {
        localStorage.setItem("adminToken", res.data.token);
        router.push("/cmsadminlogin/dashboard");
      } else {
        setError("Invalid credentials. Please try again.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="form-style1 login-form" onSubmit={handleSubmit}>
      {/* Email Field */}
      <div className="form-group mb25">
        <label className="form-label-custom">Email</label>
        <input
          type="email"
          className="form-control custom-input"
          placeholder="Enter Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      {/* Password Field */}
      <div className="form-group mb25">
        <label className="form-label-custom">Password</label>
        <input
          type="password"
          className="form-control custom-input"
          placeholder="Enter Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {/* Error Message */}
      {error && <p className="text-danger mb20">{error}</p>}

      {/* Submit Button */}
      <div className="d-grid mb20">
        <button
          className="ud-btn btn-thm custom-submit-btn"
          type="submit"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign in"}{" "}
          <i className="fal fa-arrow-right-long btn-icon" />
        </button>
      </div>
    </form>
  );
};

export default SignIn;
