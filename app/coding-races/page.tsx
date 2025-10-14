"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type ChallengeKey = "reverse" | "fizzbuzz" | "palindrome";
type Challenge = {
  key: ChallengeKey;
  name: string;
  desc: string;
  starter: string;
  test: (fn: (input: any) => any) => { passed: number; total: number; details: string[] };
};

const challenges: Record<ChallengeKey, Challenge> = {
  reverse: {
    key: "reverse",
    name: "Reverse String",
    desc: "Write a function solve(s) that returns the reversed string.",
    starter: `// Implement solve(s: string): string
function solve(s){
  // your code here
  return s;
}
`,
    test: (fn) => {
      const cases = [
        ["hello", "olleh"],
        ["", ""],
        ["racecar", "racecar"],
        ["OpenAI", "IAnepO"],
      ];
      const details: string[] = [];
      let passed = 0;
      for (const [inp, exp] of cases) {
        let got: any;
        try { got = fn(inp); } catch (e:any) { details.push(`Error on "${inp}": ${e?.message||e}`); continue; }
        if (got === exp) { passed++; details.push(`✓ "${inp}" -> "${got}"`); }
        else { details.push(`✗ "${inp}" -> "${got}" (expected "${exp}")`); }
      }
      return { passed, total: cases.length, details };
    }
  },
  fizzbuzz: {
    key: "fizzbuzz",
    name: "FizzBuzz",
    desc: "Write solve(n) that returns an array of strings from 1..n with FizzBuzz rules.",
    starter: `// Implement solve(n: number): string[]
// For multiples of 3 use "Fizz", of 5 "Buzz", of both "FizzBuzz", else number string.
function solve(n){
  // your code here
  return [];
}
`,
    test: (fn) => {
      const cases = [5, 15];
      const expect = (n:number) => Array.from({length:n}, (_,i)=>{
        const x=i+1;
        return x%15===0?"FizzBuzz":x%3===0?"Fizz":x%5===0?"Buzz":String(x);
      });
      const details: string[] = [];
      let passed = 0;
      for (const n of cases) {
        let got: any;
        try { got = fn(n); } catch (e:any) { details.push(`Error n=${n}: ${e?.message||e}`); continue; }
        const exp = expect(n);
        const ok = Array.isArray(got) && got.length===n && got.every((v,idx)=>v===exp[idx]);
        if (ok) { passed++; details.push(`✓ n=${n}`); }
        else { details.push(`✗ n=${n} (mismatch)`); }
      }
      return { passed, total: cases.length, details };
    }
  },
  palindrome: {
    key: "palindrome",
    name: "Palindrome Check",
    desc: "Write solve(s) that returns true if s is a palindrome, ignoring case and non-alphanumerics.",
    starter: `// Implement solve(s: string): boolean
function solve(s){
  // your code here
  return false;
}
`,
    test: (fn) => {
      const cases: [string, boolean][] = [
        ["RaceCar", true],
        ["A man, a plan, a canal: Panama", true],
        ["hello", false],
        ["", true],
      ];
      const norm = (s:string)=> s.toLowerCase().replace(/[^a-z0-9]/g,"");
      const details: string[] = [];
      let passed = 0;
      for (const [inp, exp] of cases) {
        let got: any;
        try { got = fn(inp); } catch (e:any) { details.push(`Error "${inp}": ${e?.message||e}`); continue; }
        if (got === exp) { passed++; details.push(`✓ "${inp}" -> ${got}`); }
        else { details.push(`✗ "${inp}" -> ${got} (expected ${exp})`); }
      }
      return { passed, total: cases.length, details };
    }
  }
};

type LeaderboardEntry = { challenge: ChallengeKey; timeMs: number; when: string; codeSize: number };

export default function CodingRacesPage() {
  const [selected, setSelected] = useState<ChallengeKey>("reverse");
  const ch = challenges[selected];

  const [code, setCode] = useState(ch.starter);
  const [status, setStatus] = useState("");
  const [details, setDetails] = useState<string[]>([]);
  const [mm, setMM] = useState(5);
  const [ss, setSS] = useState(0);
  const [left, setLeft] = useState(0);
  const [running, setRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const tRef = useRef<NodeJS.Timeout | null>(null);
  const chronoRef = useRef<number | null>(null);

  // leaderboard
  const [board, setBoard] = useState<LeaderboardEntry[]>([]);
  useEffect(() => {
    const raw = localStorage.getItem("codingRaceBoard");
    if (raw) setBoard(JSON.parse(raw));
  }, []);
  const saveBoard = (b: LeaderboardEntry[]) => {
    setBoard(b);
    localStorage.setItem("codingRaceBoard", JSON.stringify(b));
  };

  // change challenge resets editor
  useEffect(() => {
    setCode(ch.starter);
    setStatus("");
    setDetails([]);
  }, [selected]);

  const timeFmt = useMemo(() => {
    const m = Math.floor(left / 60);
    const s = left % 60;
    return `${m.toString().padStart(2,"0")}:${s.toString().padStart(2,"0")}`;
  }, [left]);

  const startRace = () => {
    const total = mm * 60 + ss;
    if (total <= 0) { setStatus("Please set a positive timer."); return; }
    if (running) return;
    setLeft(total);
    setRunning(true);
    setStatus("Race started. Good luck!");
    setDetails([]);
    setElapsedMs(0);
    chronoRef.current = performance.now();
  };

  useEffect(() => {
    if (!running) return;
    tRef.current = setInterval(() => {
      setLeft(x => {
        if (x <= 1) {
          clearInterval(tRef.current!);
          tRef.current = null;
          setRunning(false);
          setStatus("⏰ Time's up!");
          chronoRef.current = null;
          return 0;
        }
        return x - 1;
      });
      if (chronoRef.current != null) {
        setElapsedMs(performance.now() - chronoRef.current);
      }
    }, 1000);
    return () => { if (tRef.current) clearInterval(tRef.current); };
  }, [running]);

  const runTests = () => {
    // Compile in a confined Function; expose only solve
    let fn: any;
    try {
      // eslint-disable-next-line no-new-func
      const compiled = new Function(`${code}; return typeof solve==='function'?solve:undefined;`);
      fn = compiled();
      if (typeof fn !== "function") throw new Error("No function solve found. Please define solve(...).");
    } catch (e:any) {
      setStatus(`Compile error: ${e?.message || e}`);
      setDetails([]);
      return;
    }

    try {
      const res = ch.test(fn);
      setDetails(res.details);
      if (res.passed === res.total) {
        setStatus(`All tests passed (${res.passed}/${res.total}).`);
        if (running && chronoRef.current != null) {
          const finalMs = performance.now() - chronoRef.current;
          setElapsedMs(finalMs);
          setRunning(false);
          if (tRef.current) { clearInterval(tRef.current); tRef.current = null; }
          // Save to leaderboard
          const entry: LeaderboardEntry = {
            challenge: ch.key,
            timeMs: Math.round(finalMs),
            when: new Date().toLocaleString(),
            codeSize: code.length
          };
          saveBoard([entry, ...board].slice(0, 20));
          setStatus(s => `${s} ✅ Finished in ${(finalMs/1000).toFixed(2)}s. Saved to leaderboard.`);
        }
      } else {
        setStatus(`Tests passed: ${res.passed}/${res.total}. Keep going!`);
      }
    } catch (e:any) {
      setStatus(`Runtime error: ${e?.message || e}`);
      setDetails([]);
    }
  };

  const filteredBoard = board.filter(b => b.challenge === ch.key).sort((a,b)=>a.timeMs-b.timeMs).slice(0,5);

  return (
    <section aria-labelledby="h1">
      <h1 id="h1">Coding Races</h1>
      <p className="card">Pick a challenge, start the race timer, write <code>solve(...)</code>, and run the tests.</p>

      <div className="card" style={{ display: "grid", gap: 12 }}>
        <label>
          <span style={{ display: "block", marginBottom: 4 }}>Challenge</span>
          <select
            aria-label="Choose challenge"
            value={selected}
            onChange={e => setSelected(e.target.value as ChallengeKey)}
            style={{ padding: 8, border: "1px solid var(--border)", borderRadius: 8 }}
          >
            {Object.values(challenges).map(c => (
              <option key={c.key} value={c.key}>{c.name}</option>
            ))}
          </select>
        </label>

        <div className="card" aria-live="polite">
          <strong>{ch.name}</strong>
          <p style={{ margin: "6px 0" }}>{ch.desc}</p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <label>MM <input type="number" min={0} value={mm} onChange={e => setMM(parseInt(e.target.value || "0", 10))} style={{ width: 60 }} /></label>
          <label>SS <input type="number" min={0} max={59} value={ss} onChange={e => setSS(parseInt(e.target.value || "0",10))} style={{ width: 60 }} /></label>
          <button onClick={startRace} style={{ border: "1px solid var(--border)", borderRadius: 8, padding: "6px 10px" }}>Start Race</button>
          <div><strong>Time Left:</strong> {timeFmt}</div>
          {elapsedMs>0 && <div><strong>Your time:</strong> {(elapsedMs/1000).toFixed(2)}s</div>}
        </div>

        <label>
          <span style={{ display: "block", marginBottom: 4 }}>Editor</span>
          <textarea
            aria-label="Code editor"
            value={code}
            onChange={e => setCode(e.target.value)}
            style={{ width: "100%", height: 240, border: "1px solid var(--border)", borderRadius: 12, padding: 10, fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" }}
          />
        </label>

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={()=>setCode(ch.starter)} style={{ border: "1px solid var(--border)", borderRadius: 8, padding: "6px 10px" }}>Reset</button>
          <button onClick={runTests} style={{ border: "1px solid var(--border)", borderRadius: 8, padding: "6px 10px" }}>Run Tests</button>
        </div>

        <output aria-live="polite" style={{ color: "var(--muted)" }}>{status}</output>

        {!!details.length && (
          <div className="card" aria-label="Test details">
            <strong>Test Results</strong>
            <ul>
              {details.map((d,i)=><li key={i} style={{ margin: "4px 0" }}>{d}</li>)}
            </ul>
          </div>
        )}

        <div className="card" aria-label="Leaderboard">
          <strong>Leaderboard (Top 5, {ch.name})</strong>
          {filteredBoard.length === 0 ? <p>No results yet. Finish a race with all tests passing to appear here.</p> : (
            <ol>
              {filteredBoard.map((e, i) => (
                <li key={i}>
                  {(e.timeMs/1000).toFixed(2)}s • {e.when} • code {e.codeSize} chars
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </section>
  );
}
