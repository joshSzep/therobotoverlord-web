"use client";

import { useEffect } from "react";

export function GlobalErrorHandler() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Global error handlers can be setup here
      console.log("Global error handlers initialized");
    }
  }, []);

  return null;
}
