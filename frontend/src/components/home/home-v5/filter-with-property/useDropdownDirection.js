"use client";
import { useEffect, useRef, useState } from "react";

const MENU_MIN_HEIGHT = 250;

/**
 * Detects viewport space and returns whether the dropdown should open upward.
 * Uses getBoundingClientRect() - no external libraries.
 */
export function useDropdownDirection() {
  const wrapperRef = useRef(null);
  const [openUp, setOpenUp] = useState(false);

  const checkViewportSpace = () => {
    if (!wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    setOpenUp(spaceBelow < MENU_MIN_HEIGHT && spaceAbove > spaceBelow);
  };

  useEffect(() => {
    checkViewportSpace();
    window.addEventListener("scroll", checkViewportSpace, true);
    window.addEventListener("resize", checkViewportSpace);
    return () => {
      window.removeEventListener("scroll", checkViewportSpace, true);
      window.removeEventListener("resize", checkViewportSpace);
    };
  }, []);

  return { wrapperRef, openUp, checkViewportSpace };
}
