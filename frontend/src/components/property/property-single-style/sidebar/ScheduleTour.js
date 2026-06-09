"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTourRequestEnquiry } from "@/api/tourRequestEnquiry";

const isMongoObjectId = (value) =>
  typeof value === "string" && /^[a-f\d]{24}$/i.test(value.trim());

const BUDGET_OPTIONS = ["Up to 2 Cr", "2 - 5 Cr", "5 - 10 Cr", "Above 10 Cr"];

const ScheduleTour = ({ propertyId = "" }) => {
  const router = useRouter();
  const id = String(propertyId || "").trim();
  const canSubmit = isMongoObjectId(id);

  const [preferredAt, setPreferredAt] = useState("");
  const [budget, setBudget] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", text: "" });

  const handlePhone = (e) => {
    setPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ type: "", text: "" });

    if (!canSubmit) {
      setFeedback({
        type: "error",
        text: "Tour requests are only available for live property listings.",
      });
      return;
    }

    if (!preferredAt) {
      setFeedback({ type: "error", text: "Please choose a date and time." });
      return;
    }
    if (!budget) {
      setFeedback({ type: "error", text: "Please select your budget." });
      return;
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      setFeedback({
        type: "error",
        text: "Enter a valid 10-digit Indian mobile number.",
      });
      return;
    }

    setLoading(true);
    try {
      await createTourRequestEnquiry({
        name: name.trim(),
        email: email.trim(),
        phoneNumber: phone,
        tourType: "in-person",
        preferredTourDate: new Date(preferredAt).toISOString(),
        budget,
        message: message.trim(),
        property: id,
      });
      if (typeof window !== "undefined") {
        sessionStorage.setItem("formSubmitted", "true");
      }
      router.push("/thank-you?type=property-tour-request");
    } catch (err) {
      setFeedback({
        type: "error",
        text: typeof err === "string" ? err : err?.message || "Something went wrong.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ps-navtab">
      {!canSubmit && (
        <p className="text fz14 mb15" style={{ color: "#6c757d" }}>
          Tour scheduling is available for published listings from our database.
        </p>
      )}
      <form className="form-style1" onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-md-12">
            <div className="mb20">
              <input
                type="datetime-local"
                className="form-control"
                value={preferredAt}
                onChange={(e) => setPreferredAt(e.target.value)}
                required={canSubmit}
                disabled={!canSubmit}
              />
            </div>
          </div>
          <div className="col-md-12">
            <div className="mb20">
              <select
                className="form-control form-select"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                required={canSubmit}
                disabled={!canSubmit}
              >
                <option value="">Select Budget</option>
                {BUDGET_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="col-lg-12">
            <div className="mb20">
              <input
                type="text"
                className="form-control"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={canSubmit}
                disabled={!canSubmit}
              />
            </div>
          </div>

          <div className="col-lg-12">
            <div className="mb20">
              <input
                type="tel"
                className="form-control"
                placeholder="Phone"
                inputMode="numeric"
                autoComplete="tel"
                maxLength={10}
                value={phone}
                onChange={handlePhone}
                required={canSubmit}
                disabled={!canSubmit}
              />
            </div>
          </div>

          <div className="col-md-12">
            <div className="mb20">
              <input
                type="email"
                className="form-control"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required={canSubmit}
                disabled={!canSubmit}
              />
            </div>
          </div>

          <div className="col-md-12">
            <div className="mb10">
              <textarea
                className="form-control"
                cols={30}
                rows={4}
                placeholder="Enter Your Messages"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={!canSubmit}
              />
            </div>
          </div>

          {feedback.text && feedback.type === "error" && (
            <div className="col-md-12">
              <div className="alert alert-danger mb15" role="alert">
                {feedback.text}
              </div>
            </div>
          )}

          <div className="col-md-12">
            <div className="d-grid">
              <button
                type="submit"
                className="ud-btn btn-thm"
                disabled={loading || !canSubmit}
              >
                {loading ? "Submitting…" : "Submit a Tour Request"}
                <i className="fal fa-arrow-right-long" />
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ScheduleTour;
