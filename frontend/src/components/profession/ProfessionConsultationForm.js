"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getApiBaseUrl } from "@/api/apiBase";

const API_BASE_URL = getApiBaseUrl("http://localhost:5001");

const ProfessionConsultationForm = ({
  memberName = "",
  expertise = [],
  accountType = "",
  accountId = "",
}) => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    requirement: "",
    briefDescription: "",
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", msg: "" });

  const expertiseOptions = Array.isArray(expertise)
    ? expertise
        .map((item) => {
          if (typeof item === "string") return item.trim();
          if (item && typeof item === "object") {
            return String(item.title || item.name || "").trim();
          }
          return "";
        })
        .filter(Boolean)
    : [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhoneInput = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
    setFormData((prev) => ({ ...prev, phoneNumber: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", msg: "" });

    if (!formData.requirement) {
      setStatus({ type: "error", msg: "Please select your requirement." });
      return;
    }

    if (!/^[6-9]\d{9}$/.test(formData.phoneNumber)) {
      setStatus({
        type: "error",
        msg: "Phone number must be 10 digits and start with 6, 7, 8, or 9.",
      });
      return;
    }

    setLoading(true);

    try {
      const messageLines = [
        `Requirement: ${formData.requirement}`,
        `Professional: ${memberName || "Not specified"}`,
      ];

      if (formData.briefDescription.trim()) {
        messageLines.push(
          "",
          `Brief Description: ${formData.briefDescription.trim()}`
        );
      }

      const payload = {
        fullName: formData.fullName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        email: formData.email.trim(),
        message: messageLines.join("\n"),
      };

      const response = await fetch(
        `${API_BASE_URL}/frontend/api/consultancyenquiry`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...payload,
            issuetype: formData.requirement,
            ...(accountType ? { accounttype: accountType } : {}),
            ...(accountId ? { accountid: accountId } : {}),
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data?.status === "success") {
        if (typeof window !== "undefined") {
          sessionStorage.setItem("formSubmitted", "true");
        }

        setFormData({
          fullName: "",
          phoneNumber: "",
          email: "",
          requirement: "",
          briefDescription: "",
        });

        router.push("/thank-you?type=consultation-enquiry");
        return;
      }

      setStatus({
        type: "error",
        msg: data?.message || "Failed to submit enquiry. Please try again.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        msg: "A network error occurred. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="ld-contact-form-card__body lawyer-form" onSubmit={handleSubmit}>
      <div className="lawyer-form-grid">
        <div className="lawyer-form-group">
          <label className="ld-form-label">Full Name *</label>
          <div className="ld-input-wrap">
            <i className="fas fa-user" />
            <input
              type="text"
              className="form-control ld-form-input"
              placeholder="Enter your full name"
              name="fullName"
              required
              value={formData.fullName}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="lawyer-form-group">
          <label className="ld-form-label">Phone Number *</label>
          <div className="ld-input-wrap">
            <i className="fas fa-phone" />
            <input
              type="tel"
              className="form-control ld-form-input"
              placeholder="10-digit mobile number"
              name="phoneNumber"
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

        <div className="lawyer-form-group">
          <label className="ld-form-label">Email Address *</label>
          <div className="ld-input-wrap">
            <i className="fas fa-envelope" />
            <input
              type="email"
              className="form-control ld-form-input"
              placeholder="your@email.com"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="lawyer-form-group">
          <label className="ld-form-label">Your Requirement *</label>
          <div className="ld-input-wrap ld-input-wrap--select">
            <i className="fas fa-briefcase" />
            <select
              className="form-control ld-form-input ld-form-select"
              name="requirement"
              required
              value={formData.requirement}
              onChange={handleChange}
            >
              <option value="">Select your requirement</option>
              {expertiseOptions.map((option, index) => (
                <option key={`${option}-${index}`} value={option}>
                  {option}
                </option>
              ))}
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>

      <div className="lawyer-form-group">
        <label className="ld-form-label">Brief Description</label>
        <textarea
          className="form-control ld-form-input ld-form-textarea"
          rows={4}
          placeholder="Describe your legal requirement briefly..."
          name="briefDescription"
          value={formData.briefDescription}
          onChange={handleChange}
        />
      </div>

      {status.msg && (
        <div className="lawyer-form-alert">
          <div
            className={`alert ${
              status.type === "success" ? "alert-success" : "alert-danger"
            } mb-0`}
          >
            {status.msg}
          </div>
        </div>
      )}

      <button type="submit" className="ud-btn lawyer-form-submit" disabled={loading}>
        {/* <i className="fas fa-paper-plane me-2" /> */}
        {loading ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
};

export default ProfessionConsultationForm;
