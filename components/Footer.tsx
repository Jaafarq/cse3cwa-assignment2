"use client";

import { useEffect, useState } from "react";
import { formatDate } from "@/lib/date";

export default function Footer() {
  const [today, setToday] = useState<string>("");

  useEffect(() => {
    setToday(formatDate(new Date()));
  }, []);

  return (
    <footer className="footer" role="contentinfo">
      <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <small>© {new Date().getFullYear()} Jaafar Qassin</small>
        <small>Student No: 22210175</small>
        <small>Date: {today}</small>
      </div>
    </footer>
  );
}
