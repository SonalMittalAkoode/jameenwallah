"use client";

import { useEffect } from "react";
import Aos from "aos";
import "aos/dist/aos.css";

export default function ClientBootstrap() {
  useEffect(() => {
    import("bootstrap");
  }, []);

  useEffect(() => {
    // Delay AOS initialization to prevent hydration mismatch
    const timer = setTimeout(() => {
      Aos.init({
        duration: 1200,
        once: true,
        disable: false,
        startEvent: "DOMContentLoaded",
      });
    }, 100); // Small delay to ensure hydration is complete

    return () => clearTimeout(timer);
  }, []);

  return null;
}
