"use client";
import { useEffect, useMemo, useRef, useState } from "react";

type StageKey = 1 | 2 | 3 | 4;

export default function EscapeRoom() {
  const [bgReady, setBgReady] = useState(false);

  // Timer
  const [mm, setMM] = useState(5);
  const [ss, setSS] = useState(0);
  const [left, setLeft] = useState(0);
  const [running, setRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Stages state
  const [stage, setStage] = useState<StageKey>(1);
  const [s1Code, setS1Code] = useState("function add(a,b){return a+b}");
  const [s2Clicked, setS2Clicked] = useState(false);
  const [s3Result, setS3Result] = useState<string>("");
  const [s4Json, setS4Json] = useState('[{"a":1,"b":2},{"a":3,"b":4}]');
  const [s4Csv, setS4Csv] = useState("");

  // Preload background
  useEffect(() => {
    const img = new Image();
    img.onload = () => setBgReady(true);
    img.src = "/escape-room.jpg";
  }, []);

  const startTimer = () => {
    const total = mm * 60 + ss;
    if (total <= 0) return;
    setLeft(total);
    setRunning(true);
  };

  useEffect(() => {
    if (!running) return;
    timerRef.current = setInterval(() => {
      setLeft(x => {
        if (x <= 1) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          setRunning(false);
          alert("⏰ Time's up!");
          return 0;
        }
        return x - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [running]);

  const timeFmt = useMemo(() => {
    const m = Math.floor(left / 60);
    const s = left % 60;
    return `${m.toString().padStart(2,"0")}:${s.toString().padStart(2,"0")}`;
  }, [left]);

  const onS1Check = () => {
    // "Format code correctly": naive check that code has a semicolon after return (for demo) and spaces after comma
    const good = /return\s+[a-zA-Z0-9_]+\s*\+\s*[a-zA-Z0-9_]+;/.test(s1Code) && /function\s+add\(\s*a\s*,\s*b\s*\)/.test(s1Code);
    if (good) {
      alert("Stage 1 complete!");
      setStage(2);
    } else {
      alert("Hint: Add proper spacing in parameters and a semicolon after the return expression.");
    }
  };

  const onS2Debug = () => {
    setS2Clicked(true);
    alert("Nice! You inspected the buggy area and found the missing alt text issue.");
    setStage(3);
  };

  const onS3Generate = () => {
    const nums = Array.from({ length: 1001 }, (_, i) => i);
    setS3Result(nums.join(","));
    setStage(4);
  };

  const onS4Transform = () => {
    try {
      const arr = JSON.parse(s4Json);
      if (!Array.isArray(arr)) throw new Error("Must be array of objects");
      const headers = Array.from(new Set(arr.flatMap((o: any) => Object.keys(o))));
      const lines = [
        headers.join(","),
        ...arr.map((o: any) => headers.map(h => JSON.stringify(o[h] ?? "")).join(","))
      ];
      setS4Csv(lines.join("\n"));
      alert("All stages complete — you escaped! 🎉");
    } catch (e: any) {
      alert("Invalid JSON. Example: [{\"a\":1,\"b\":2}]");
    }
  };

  return (
    <section
      style={{
        backgroundImage: "url(/escape-room.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        borderRadius: 12,
        padding: 16,
        minHeight: "70vh",
      }}
      aria-label="Escape Room"
    >
      <h1>Escape Room</h1>
      <p>Set your timer and complete all stages to escape.</p>

      <div className="card" style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <label>MM <input type="number" min={0} value={mm} onChange={e => setMM(parseInt(e.target.value || "0", 10))} style={{ width: 60 }} /></label>
        <label>SS <input type="number" min={0} max={59} value={ss} onChange={e => setSS(parseInt(e.target.value || "0",10))} style={{ width: 60 }} /></label>
        <button onClick={startTimer} style={{ border: "1px solid var(--border)", borderRadius: 8, padding: "6px 10px" }}>Start Timer</button>
        <div aria-live="polite"><strong>Time Left:</strong> {timeFmt}</div>
      </div>

      {/* Stage cards */}
      <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
        <div className="card" aria-label="Stage 1">
          <h2>Stage 1: Format the code correctly</h2>
          <p>Ensure the function signature has proper spacing and the return line ends with a semicolon.</p>
          <textarea value={s1Code} onChange={e => setS1Code(e.target.value)} style={{ width: "100%", height: 120 }} />
          <div><button onClick={onS1Check} style={{ border: "1px solid var(--border)", borderRadius: 8, padding: "6px 10px" }}>Check</button></div>
        </div>

        {stage >= 2 && (
          <div className="card" aria-label="Stage 2">
            <h2>Stage 2: Click the buggy area to debug</h2>
            <p>There is an accessibility bug around the judge's desk. Click the glowing area to acknowledge and fix.</p>
            <div
              onClick={onS2Debug}
              style={{
                width: 180, height: 90, borderRadius: 12,
                border: "2px dashed #f59e0b", background: "#fff8e1",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer"
              }}
              aria-label="Buggy area"
            >
              {s2Clicked ? "Fixed!" : "Click to debug"}
            </div>
          </div>
        )}

        {stage >= 3 && (
          <div className="card" aria-label="Stage 3">
            <h2>Stage 3: Produce the numbers between 0 and 1000</h2>
            <button onClick={onS3Generate} style={{ border: "1px solid var(--border)", borderRadius: 8, padding: "6px 10px" }}>Generate</button>
            <div style={{ marginTop: 8, maxHeight: 160, overflow: "auto", border: "1px solid var(--border)", borderRadius: 8, padding: 8 }}>
              <code style={{ wordBreak: "break-word" }}>{s3Result}</code>
            </div>
          </div>
        )}

        {stage >= 4 && (
          <div className="card" aria-label="Stage 4">
            <h2>Stage 4: Port data (JSON → CSV)</h2>
            <p>Paste JSON array of objects, then click Transform.</p>
            <textarea value={s4Json} onChange={e => setS4Json(e.target.value)} style={{ width: "100%", height: 140 }} />
            <button onClick={onS4Transform} style={{ marginTop: 8, border: "1px solid var(--border)", borderRadius: 8, padding: "6px 10px" }}>Transform</button>
            <h3>CSV Output</h3>
            <textarea value={s4Csv} readOnly style={{ width: "100%", height: 140 }} />
          </div>
        )}
      </div>
    </section>
  );
}
