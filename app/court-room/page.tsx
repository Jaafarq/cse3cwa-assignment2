"use client";

import { useMemo, useState } from "react";

type Finding = {
  xss: boolean;
  sqli: boolean;
  missingAlt: boolean;
  weakCrypto: boolean;
};

type QuizQ = { q: string; options: string[]; answer: number };

const EXHIBIT_A = String.raw`// Exhibit A: Comment form handler (server)
app.post('/comment', (req, res) => {
  const text = req.body.text; // no validation
  // Directly render back to HTML:
  res.send(\`<div class="comment">\${text}</div>\`);
});`;

const EXHIBIT_B = String.raw`-- Exhibit B: User lookup
SELECT * FROM users WHERE username = '` + "${username}" + `' AND password = '` + "${password}" + `';`;

const QUIZ: QuizQ[] = [
  {
    q: "What defense best prevents reflected XSS in Exhibit A?",
    options: ["CSRF token", "Output encoding/escaping", "CSP 'self' only", "HSTS"],
    answer: 1
  },
  {
    q: "What is the most appropriate fix for Exhibit B?",
    options: [
      "Disable the login endpoint",
      "Use parameterized queries/prepared statements",
      "Hash the password with MD5",
      "Add a WAF rule"
    ],
    answer: 1
  }
];

function buildVerdictHTML(findings: Finding, reasoning: string) {
  const items: string[] = [];
  if (findings.xss) items.push("<li>Reflected XSS identified in Exhibit A due to unsanitized output.</li>");
  if (findings.sqli) items.push("<li>SQL Injection risk identified in Exhibit B due to string interpolation in query.</li>");
  if (findings.missingAlt) items.push("<li>Accessibility violation: missing alt text on key images.</li>");
  if (findings.weakCrypto) items.push("<li>Weak cryptographic practice suspected (e.g., non-salted or deprecated hash).</li>");
  if (items.length === 0) items.push("<li>No material vulnerabilities established beyond reasonable doubt.</li>");
  const safeReason = reasoning
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/\n/g,"<br/>");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Court Room Verdict</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial; line-height:1.6; color:#111; background:#fff; padding:16px;">
  <h1 style="margin-top:0;">Court Room Verdict</h1>
  <h2>Findings</h2>
  <ul>
    ${items.join("\n")}
  </ul>
  <h2>Reasoning</h2>
  <p>${safeReason || "No additional reasoning provided."}</p>
  <h2>Order</h2>
  <ol>
    <li>Remediate identified issues before release.</li>
    <li>Implement automated tests for XSS and SQLi regressions.</li>
    <li>Conduct an accessibility pass (WCAG AA).</li>
  </ol>
</body>
</html>`;
}

export default function CourtRoomPage() {
  const [findings, setFindings] = useState<Finding>({
    xss: true,
    sqli: true,
    missingAlt: false,
    weakCrypto: false
  });

  const [quizAns, setQuizAns] = useState<(number | null)[]>(QUIZ.map(() => null));
  const [quizResult, setQuizResult] = useState<string>("");
  const [reasoning, setReasoning] = useState<string>(
    "Based on the exhibits and accepted AppSec controls, the court finds material vulnerabilities that require remediation."
  );
  const [verdictHtml, setVerdictHtml] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  // ✅ Ensure score is a number by giving reduce an initial value (0) and typing the memo
  const score: number = useMemo(
    () =>
      quizAns.reduce<number>(
        (acc, a, i) => acc + (a === QUIZ[i].answer ? 1 : 0),
        0
      ),
    [quizAns]
  );

  const runQuizCheck = () => {
    const total = QUIZ.length;
    setQuizResult(
      `Quiz score: ${score}/${total}. ${
        score === total
          ? "Excellent."
          : score >= 1
          ? "Partial understanding—review the weaker area."
          : "Please review both topics."
      }`
    );
  };

  const generateVerdict = () => {
    const html = buildVerdictHTML(findings, reasoning);
    setVerdictHtml(html);
    setStatus("Verdict generated. You can copy it or save it to the database.");
  };

  const saveVerdict = async () => {
    if (!verdictHtml) { setStatus("Generate verdict first."); return; }
    setStatus("Saving verdict…");
    const res = await fetch("/api/outputs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Court Room Verdict", html: verdictHtml })
    });
    if (!res.ok) { setStatus("Save failed."); return; }
    const j = await res.json();
    setStatus(`Saved ✔ (id: ${j.id}). View at /share/${j.id}`);
  };

  return (
    <section aria-labelledby="h1">
      <h1 id="h1">Court Room</h1>
      <p className="card">Review the exhibits, identify issues, answer the quiz, and generate a formal verdict that you can save and share.</p>

      <div className="card" aria-label="Case Brief">
        <h2>Case Brief</h2>
        <p>
          The prosecution asserts that the application under review has critical security and accessibility defects. The defense claims the issues are either false positives or non-exploitable in practice. The court will examine Exhibits A and B, evaluate the issues, and deliver a verdict.
        </p>
      </div>

      <div className="card" aria-label="Exhibits">
        <h2>Exhibit A (Server-side XSS risk)</h2>
        <pre style={{ whiteSpace: "pre-wrap" }}><code>{EXHIBIT_A}</code></pre>

        <h2>Exhibit B (SQL Injection risk)</h2>
        <pre style={{ whiteSpace: "pre-wrap" }}><code>{EXHIBIT_B}</code></pre>
      </div>

      <div className="card" aria-label="Issue Identification">
        <h2>Identify Issues (tick all that apply)</h2>
        <label style={{ display: "block", margin: "6px 0" }}>
          <input
            type="checkbox"
            checked={findings.xss}
            onChange={e => setFindings(f => ({ ...f, xss: e.target.checked }))}
          /> Reflected XSS (Exhibit A: unsanitized output)
        </label>
        <label style={{ display: "block", margin: "6px 0" }}>
          <input
            type="checkbox"
            checked={findings.sqli}
            onChange={e => setFindings(f => ({ ...f, sqli: e.target.checked }))}
          /> SQL Injection (Exhibit B: string interpolation in query)
        </label>
        <label style={{ display: "block", margin: "6px 0" }}>
          <input
            type="checkbox"
            checked={findings.missingAlt}
            onChange={e => setFindings(f => ({ ...f, missingAlt: e.target.checked }))}
          /> Accessibility: Missing alt text on images
        </label>
        <label style={{ display: "block", margin: "6px 0" }}>
          <input
            type="checkbox"
            checked={findings.weakCrypto}
            onChange={e => setFindings(f => ({ ...f, weakCrypto: e.target.checked }))}
          /> Weak cryptography (deprecated hashing or no salt)
        </label>
      </div>

      <div className="card" aria-label="Cross-examination Quiz">
        <h2>Cross-Examination Quiz</h2>
        {QUIZ.map((item, idx) => (
          <fieldset key={idx} className="card" style={{ marginBottom: 8 }}>
            <legend>Q{idx+1}. {item.q}</legend>
            {item.options.map((opt, i) => (
              <label key={i} style={{ display: "block", margin: "4px 0" }}>
                <input
                  type="radio"
                  name={`q${idx}`}
                  checked={quizAns[idx] === i}
                  onChange={() => setQuizAns(a => a.map((v, k) => k===idx ? i : v))}
                /> {opt}
              </label>
            ))}
            {quizAns[idx] != null && (
              <p style={{ color: quizAns[idx]===item.answer ? "green" : "crimson" }}>
                {quizAns[idx]===item.answer ? "Correct." : "Incorrect."}
              </p>
            )}
          </fieldset>
        ))}
        <button onClick={runQuizCheck} style={{ border: "1px solid var(--border)", borderRadius: 8, padding: "6px 10px" }}>Check Score</button>
        {!!quizResult && <p aria-live="polite" style={{ marginTop: 8 }}>{quizResult}</p>}
      </div>

      <div className="card" aria-label="Verdict">
        <h2>Verdict Draft</h2>
        <label>
          <span style={{ display: "block", marginBottom: 4 }}>Reasoning (optional)</span>
          <textarea
            value={reasoning}
            onChange={e => setReasoning(e.target.value)}
            style={{ width: "100%", height: 140, border: "1px solid var(--border)", borderRadius: 12, padding: 10 }}
          />
        </label>

        <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
          <button onClick={generateVerdict} style={{ border: "1px solid var(--border)", borderRadius: 8, padding: "6px 10px" }}>Generate Verdict</button>
          <button
            onClick={() => { if (verdictHtml) navigator.clipboard.writeText(verdictHtml); }}
            disabled={!verdictHtml}
            style={{ border: "1px solid var(--border)", borderRadius: 8, padding: "6px 10px" }}
          >
            Copy Verdict HTML
          </button>
          <button
            onClick={saveVerdict}
            disabled={!verdictHtml}
            style={{ border: "1px solid var(--border)", borderRadius: 8, padding: "6px 10px" }}
          >
            Save Verdict to DB
          </button>
          <a href="/outputs" style={{ border: "1px solid var(--border)", borderRadius: 8, padding: "6px 10px" }}>
            View Saved Outputs
          </a>
        </div>

        <output aria-live="polite" style={{ color: "var(--muted)" }}>{status}</output>

        {verdictHtml && (
          <>
            <h3 style={{ marginTop: 12 }}>Preview</h3>
            <iframe
              title="Verdict Preview"
              style={{ width: "100%", height: "50vh", border: "1px solid var(--border)", borderRadius: 12 }}
              srcDoc={verdictHtml}
            />
          </>
        )}
      </div>
    </section>
  );
}
