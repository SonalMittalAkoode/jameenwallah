"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

const Form = ({ source = "contact" }) => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", msg: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhoneInput = (e) => {
    // Keep only numbers and limit to 10 characters for Indian phone standard used in backend
    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
    setFormData((prev) => ({ ...prev, phoneNumber: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", msg: "" });

    // Client-side quick validation to match backend rules
    if (!/^[6-9]\d{9}$/.test(formData.phoneNumber)) {
      setStatus({ type: "error", msg: "Phone number must be 10 digits and start with 6, 7, 8, or 9." });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/frontend/api/enquiry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, source }),
      });

      const data = await response.json();

      if (response.ok && data.status === "success") {
        setFormData({ fullName: "", phoneNumber: "", email: "", message: "" });
        
        // Use sessionStorage to mark that the form was submitted successfully
        // This is used by the thank-you page to verify the user should be allowed to view it
        if (typeof window !== 'undefined') {
          sessionStorage.setItem("formSubmitted", "true");
        }
        
        // Redirect to protected thank-you page with specific type parameter
        router.push(`/thank-you?type=${source}-enquiry`);
      } else {
        setStatus({ type: "error", msg: data.message || "Failed to send enquiry." });
      }
    } catch (error) {
      setStatus({ type: "error", msg: "A network error occurred. Please try again later." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="form-style1" onSubmit={handleSubmit}>
      <div className="row">
        <div className="col-lg-12">
          <div className="mb20">
            <label className="heading-color ff-heading fw600 mb10">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              className="form-control"
              placeholder="Your Name"
              required
              value={formData.fullName}
              onChange={handleChange}
            />
          </div>
        </div>
        {/* End .col-lg-12 */}

        <div className="col-md-12">
          <div className="mb20">
            <label className="heading-color ff-heading fw600 mb10">
              Mobile Number
            </label>
            <input
              type="tel"
              name="phoneNumber"
              className="form-control"
              placeholder="Mobile Number"
              required
              inputMode="numeric"
              autoComplete="tel"
              maxLength={10}
              pattern="^[6-9][0-9]{9}$"
              value={formData.phoneNumber}
              onChange={handlePhoneInput}
            />
          </div>
        </div>
        {/* End .col-md-12 */}

        <div className="col-md-12">
          <div className="mb20">
            <label className="heading-color ff-heading fw600 mb10">Email</label>
            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="Email"
              required
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
        </div>
        {/* End .col-lg-12 */}

        <div className="col-md-12">
          <div className="mb10">
            <label className="heading-color ff-heading fw600 mb10">
              Message
            </label>
            <textarea
              name="message"
              cols={30}
              rows={4}
              placeholder="How can we help you?"
              required
              value={formData.message}
              onChange={handleChange}
            />
          </div>
        </div>
        {/* End .col-lg-12 */}

        {status.msg && (
          <div className="col-md-12 mb20">
            <div className={`alert ${status.type === "success" ? "alert-success" : "alert-danger"}`} role="alert">
              {status.msg}
            </div>
          </div>
        )}

        <div className="col-md-12">
          <div className="d-grid">
            <button type="submit" className="ud-btn btn-thm" disabled={loading}>
              {loading ? "Sending..." : "Submit"}
              <i className="fal fa-arrow-right-long" />
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default Form;
