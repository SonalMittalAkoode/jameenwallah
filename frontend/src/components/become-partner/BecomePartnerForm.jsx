"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBecomePartnerEnquiry } from "@/api/becomePartnerEnquiry";

const ROLE_OPTIONS = [
  { value: "Lawyer", label: "Lawyer" },
  { value: "Chartered Accountant", label: "Chartered Accountant" },
  { value: "Financer", label: "Financer" },
];

export default function BecomePartnerForm() {
  const router = useRouter();
  const [partnertype, setPartnertype] = useState(ROLE_OPTIONS[0].value);
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePhone = (e) => {
    setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!/^[6-9]\d{9}$/.test(phoneNumber)) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }

    setLoading(true);
    try {
      await createBecomePartnerEnquiry({
        fullName: fullName.trim(),
        phoneNumber,
        email: email.trim(),
        message: message.trim(),
        partnertype,
      });
      if (typeof window !== "undefined") {
        sessionStorage.setItem("formSubmitted", "true");
      }
      router.push("/thank-you?type=become-partner-enquiry");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Something went wrong. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="form-style1" onSubmit={handleSubmit}>
      <div className="mb20">
        <label className="form-label visually-hidden" htmlFor="partner-role">
          Partner type
        </label>
        <select
          id="partner-role"
          className="form-control form-select"
          value={partnertype}
          onChange={(e) => setPartnertype(e.target.value)}
          required
        >
          {ROLE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div className="mb20">
        <input
          type="text"
          className="form-control"
          placeholder="Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
      </div>
      <div className="mb20">
        <input
          type="tel"
          className="form-control"
          placeholder="Phone no"
          inputMode="numeric"
          autoComplete="tel"
          maxLength={10}
          value={phoneNumber}
          onChange={handlePhone}
          required
        />
      </div>
      <div className="mb20">
        <input
          type="email"
          className="form-control"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="mb25">
        <textarea
          className="form-control"
          rows={5}
          placeholder="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
      </div>
      {error && (
        <div className="alert alert-danger mb20" role="alert">
          {error}
        </div>
      )}
      <div className="text-center">
        <button type="submit" className="ud-btn btn-thm" disabled={loading}>
          {loading ? "Submitting…" : "Submit"}
        </button>
      </div>
    </form>
  );
}
