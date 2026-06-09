"use client";

import React from "react";

const FaqWidget = ({ faqs }) => {
  if (!faqs || faqs.length === 0) return null;

  return (
    <div className="accordion-style1 faq-page">
      <div className="accordion" id="accordionExample">
        {faqs.map((faq, index) => (
          <div
            className={`accordion-item ${index === 0 ? "active" : ""}`}
            key={`faq-${index}`}
          >
            <h2 className="accordion-header" id={`heading${index}`}>
              <button
                className={`accordion-button ${index === 0 ? "" : "collapsed"}`}
                type="button"
                data-bs-toggle="collapse"
                data-bs-target={`#collapse${index}`}
                aria-expanded={index === 0 ? "true" : "false"}
                aria-controls={`collapse${index}`}
              >
                {faq.question}
              </button>
            </h2>
            <div
              id={`collapse${index}`}
              className={`accordion-collapse collapse ${
                index === 0 ? "show" : ""
              }`}
              aria-labelledby={`heading${index}`}
              data-bs-parent="#accordionExample"
            >
              <div className="accordion-body">
                <p>{faq.answer}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FaqWidget;
