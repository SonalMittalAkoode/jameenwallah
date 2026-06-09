 "use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { subscribeToNewsletter } from "@/api/subscribe";

const Subscribe = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", text: "" });
  const [showThankYou, setShowThankYou] = useState(false);
  const [thankEmail, setThankEmail] = useState("");
  const closeBtnRef = useRef(null);

  useEffect(() => {
    if (showThankYou) closeBtnRef.current?.focus();
  }, [showThankYou]);

  useEffect(() => {
    if (!showThankYou) return;

    // Auto-dismiss after a short time; user can also close manually.
    const t = setTimeout(() => setShowThankYou(false), 3500);
    return () => clearTimeout(t);
  }, [showThankYou]);

  const onSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const cleanEmail = (email || "").trim();
      if (!cleanEmail || loading) return;

      setLoading(true);
      setFeedback({ type: "", text: "" });
      try {
        await subscribeToNewsletter(cleanEmail);
        setEmail("");
        setFeedback({
          type: "success",
          text: "Subscribed successfully.",
        });
        setThankEmail(cleanEmail);
        setShowThankYou(true);
      } catch (err) {
        setFeedback({
          type: "error",
          text: err?.message || "Subscription failed. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    },
    [email, loading]
  );

  return (
    <>
      <form
        className="mailchimp-widget text-center mb30-md mb60"
        onSubmit={onSubmit}
      >
      <h2 className="title text-white">Receive Trusted Property Updates</h2>
      <h6 className="title text-white mb35 fw400">
        Get the latest property launches, market insights, and investment
        opportunities across Gurgaon.
      </h6>
      <div className="mailchimp-style2">
        <input
          type="email"
          className="form-control"
          placeholder="Enter your email address"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
        <button className="ud-btn btn-thm" type="submit" disabled={loading}>
          {loading ? "Subscribing..." : "Subscribe"}
        </button>
      </div>
      {!!feedback.text && (
        <p
          className={
            feedback.type === "success"
              ? "text-success mt10 mb-0"
              : "text-danger mt10 mb-0"
          }
        >
          {feedback.text}
        </p>
      )}
      </form>

      {showThankYou && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Subscription successful"
          onKeyDown={(e) => {
            if (e.key === "Escape") setShowThankYou(false);
          }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(24, 26, 32, 0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 99999,
            padding: 16,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 520,
              background: "var(--headings-color)",
              borderRadius: 14,
              padding: 20,
              color: "#fff",
              boxShadow:
                "0 18px 60px rgba(0,0,0,0.35), 0 2px 10px rgba(0,0,0,0.22)",
              animation: "fadeInUp 0.25s ease both",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
              <div
                aria-hidden="true"
                style={{
                  width: 86,
                  height: 86,
                  borderRadius: 999,
                  background: "rgba(255, 56, 92, 0.18)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 34,
                  color: "var(--primary-color)",
                  marginBottom: 10,
                }}
              >
                ✓
              </div>

              <h3 style={{ margin: 0, fontSize: 30, lineHeight: 1.1, fontWeight: 800 }}>
                Thank you!
              </h3>

              <p style={{ margin: "10px 0 0", color: "#e5e7eb", fontSize: 14, maxWidth: 440 }}>
                {thankEmail ? (
                  <>
                    You’re subscribed to our updates for <b>{thankEmail}</b>.
                  </>
                ) : (
                  <>You’re subscribed to our updates.</>
                )}
              </p>

            </div>

            <div style={{ display: "flex", justifyContent: "center", marginTop: 18 }}>
              <button
                ref={closeBtnRef}
                type="button"
                className="ud-btn btn-thm"
                onClick={() => setShowThankYou(false)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Subscribe;
