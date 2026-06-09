"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  callRequestServiceOptions,
  createCallRequestFrontend,
} from "@/api/callRequest";

const initialForm = {
  name: "",
  phone: "",
  service: "Buy Property",
};

const normalizeIndianPhone = (value) => {
  const digits = String(value || "").replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  return digits.slice(0, 10);
};

const isValidIndianPhone = (value) => /^[6-9]\d{9}$/.test(value);

const ScheduleCallPopover = ({
  triggerClassName = "login-info d-flex align-items-cente top-phone",
  triggerLabel = "",
  triggerIconClass = "far fa-phone fz16 me-2",
  triggerAriaLabel = "Request a call",
}) => {
  const [open, setOpen] = useState(false);
  const [pinnedOpen, setPinnedOpen] = useState(false);
  const [formData, setFormData] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });
  const closeTimerRef = useRef(null);
  const triggerRef = useRef(null);
  const popoverRef = useRef(null);
  const popoverWidth = 300;

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const handleDocPointerDown = (event) => {
      if (!open) return;
      const target = event.target;
      const insideTrigger = triggerRef.current?.contains(target);
      const insidePopover = popoverRef.current?.contains(target);
      if (!insideTrigger && !insidePopover) {
        setOpen(false);
        setPinnedOpen(false);
      }
    };
    document.addEventListener("mousedown", handleDocPointerDown);
    return () => {
      document.removeEventListener("mousedown", handleDocPointerDown);
    };
  }, [open]);

  const keepOpen = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const preferredLeft = rect.right - popoverWidth;
      const minLeft = 12;
      const maxLeft = Math.max(minLeft, viewportWidth - popoverWidth - 12);
      const left = Math.min(Math.max(preferredLeft, minLeft), maxLeft);
      const top = rect.bottom + 8;
      // If button is too low, open upward.
      const finalTop = top + 340 > viewportHeight ? Math.max(12, rect.top - 340) : top;
      setPopoverPos({ top: finalTop, left });
    }
    setOpen(true);
  };

  const scheduleClose = () => {
    if (pinnedOpen) return;
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      setOpen(false);
    }, 160);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "phone" ? normalizeIndianPhone(value) : value,
    }));
    if (submitted) setSubmitted(false);
    if (submitError) setSubmitError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");
    const name = formData.name.trim();
    const phoneNumber = normalizeIndianPhone(formData.phone);
    const service = formData.service;

    if (!name) {
      setSubmitError("Please enter your name.");
      setSubmitting(false);
      return;
    }

    if (!isValidIndianPhone(phoneNumber)) {
      setSubmitError("Please enter a valid 10 digit mobile number.");
      setSubmitting(false);
      return;
    }

    if (!callRequestServiceOptions.includes(service)) {
      setSubmitError("Please choose a valid service option.");
      setSubmitting(false);
      return;
    }

    try {
      await createCallRequestFrontend({
        name,
        phoneNumber,
        service,
        sourcePage:
          typeof window !== "undefined"
            ? `${window.location.pathname}${window.location.search}`
            : "",
      });
      setSubmitted(true);
      setFormData(initialForm);
    } catch (err) {
      setSubmitError(err?.message || "Unable to submit request");
      setSubmitted(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="schedule-call-wrap"
      onMouseEnter={keepOpen}
      onMouseLeave={scheduleClose}
    >
      <button
        ref={triggerRef}
        type="button"
        className={triggerClassName}
        role="button"
        aria-label={triggerAriaLabel}
        title={triggerAriaLabel}
        onMouseEnter={keepOpen}
        onClick={(e) => {
          e.preventDefault();
          if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
          setOpen((prev) => {
            const next = !prev;
            setPinnedOpen(next);
            return next;
          });
        }}
      >
        <i className={triggerIconClass} />
        {triggerLabel}
      </button>

      {open
        ? createPortal(
            <div
              ref={popoverRef}
              className="schedule-call-popover schedule-call-popover--portal"
              style={{ top: `${popoverPos.top}px`, left: `${popoverPos.left}px` }}
              onMouseEnter={keepOpen}
              onMouseLeave={scheduleClose}
            >
              <h6 className="schedule-call-popover__title">Request a Call</h6>
              <p className="schedule-call-popover__subtitle mb-0">
                Share your number and the service you need. Our team will connect shortly.
              </p>
              <form onSubmit={handleSubmit} className="schedule-call-popover__form">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your Name"
                  className="form-control"
                  required
                />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone Number"
                  className="form-control"
                  inputMode="numeric"
                  pattern="[6-9][0-9]{9}"
                  maxLength={10}
                  autoComplete="tel"
                  required
                />
                <select
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  className="form-control"
                  required
                >
                  {callRequestServiceOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="ud-btn btn-thm w-100 bdrs12"
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Submit"}
                </button>
                {submitError ? (
                  <p className="schedule-call-popover__error mb-0">{submitError}</p>
                ) : null}
                {submitted ? (
                  <p className="schedule-call-popover__success mb-0">
                    Thanks. We will call you shortly.
                  </p>
                ) : null}
              </form>
            </div>,
            document.body
          )
        : null}
    </div>
  );
};

export default ScheduleCallPopover;
