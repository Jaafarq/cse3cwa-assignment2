"use client";

import { useState } from "react";
import { buildTabsHTML, type Tab } from "@/lib/tabsGenerator";

export default function HomePage() {
  const [title, setTitle] = useState("My Tabs Demo");
  const [tabs, setTabs] = useState<Tab[]>([
    { title: "Tab 1", content: "<p>Hello from Tab 1</p>" },
    { title: "Tab 2", content: "<p>Welcome to Tab 2</p>" }
  ]);
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState<string>("");

  const addTab = () =>
    setTabs(t => [...t, { title: `Tab ${t.length + 1}`, content: "<p>New content</p>" }]);

  const removeTab = (idx: number) =>
    setTabs(t => t.filter((_, i) => i !== idx));

  const generate = () => {
    const html = buildTabsHTML(title, tabs);
    setOutput(html);
    setStatus("Generated ✔");
  };

  const copyOut = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setStatus("Copied! Paste into a file named Hello.html and open in your browser.");
  };

  const saveToDB = async () => {
    if (!output) {
      setStatus("Please Generate first before saving.");
      return;
    }
    try {
      setStatus("Saving…");
      const res = await fetch("/api/outputs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, html: output })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || `Save failed (${res.status})`);
      }
      const json = await res.json();
      setStatus(`Saved ✔ (id: ${json.id}). View at /share/${json.id}`);
    } catch (e: any) {
      setStatus(`Save failed: ${e?.message || e}`);
    }
  };

  return (
    <section aria-labelledby="h1">
      <h1 id="h1">Tabs HTML Generator</h1>
      <p className="card" style={{ marginTop: 8 }}>
        Configure your tabs below. Click <strong>Generate</strong> to produce standalone HTML5 + JS with
        inline CSS (no classes). Copy it into a file named <code>Hello.html</code> and open in your browser,
        or <strong>Save to DB</strong> and open it later via a shareable page.
      </p>

      <div className="card" style={{ display: "grid", gap: 12, marginTop: 12 }}>
        <label>
          <span style={{ display: "block", marginBottom: 4 }}>Title</span>
          <input
            aria-label="Document title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            style={{ width: "100%", padding: 8, border: "1px solid var(--border)", borderRadius: 8 }}
          />
        </label>

        <div>
          <h2 style={{ margin: "8px 0" }}>Tabs</h2>
          {tabs.map((tab, idx) => (
            <fieldset key={idx} aria-label={`Tab ${idx + 1}`} className="card" style={{ marginBottom: 8 }}>
              <legend>Tab {idx + 1}</legend>
              <label>
                <span style={{ display: "block", marginBottom: 4 }}>Tab Title</span>
                <input
                  value={tab.title}
                  onChange={e => {
                    const v = e.target.value;
                    setTabs(t => t.map((tt, i) => (i === idx ? { ...tt, title: v } : tt)));
                  }}
                  style={{ width: "100%", padding: 8, border: "1px solid var(--border)", borderRadius: 8 }}
                />
              </label>
              <label>
                <span style={{ display: "block", margin: "8px 0 4px" }}>Tab Content (HTML allowed)</span>
                <textarea
                  value={tab.content}
                  onChange={e => {
                    const v = e.target.value;
                    setTabs(t => t.map((tt, i) => (i === idx ? { ...tt, content: v } : tt)));
                  }}
                  style={{ width: "100%", height: 120, padding: 8, border: "1px solid var(--border)", borderRadius: 8 }}
                />
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  onClick={() => removeTab(idx)}
                  aria-label={`Remove Tab ${idx + 1}`}
                  style={{ padding: "6px 10px", border: "1px solid var(--border)", borderRadius: 8 }}
                >
                  Remove
                </button>
              </div>
            </fieldset>
          ))}
          <button
            type="button"
            onClick={addTab}
            style={{ padding: "8px 12px", border: "1px solid var(--border)", borderRadius: 8 }}
          >
            + Add Tab
          </button>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            onClick={generate}
            style={{ padding: "10px 14px", border: "1px solid var(--border)", borderRadius: 10 }}
          >
            Generate
          </button>
          <button
            onClick={copyOut}
            disabled={!output}
            style={{ padding: "10px 14px", border: "1px solid var(--border)", borderRadius: 10 }}
          >
            Copy
          </button>
          <button
            onClick={saveToDB}
            disabled={!output}
            style={{ padding: "10px 14px", border: "1px solid var(--border)", borderRadius: 10 }}
          >
            Save to DB
          </button>
          <a
            href="/outputs"
            style={{ padding: "10px 14px", border: "1px solid var(--border)", borderRadius: 10 }}
          >
            View Saved Outputs
          </a>
        </div>

        <output aria-live="polite" style={{ color: "var(--muted)" }}>{status}</output>

        <label>
          <span style={{ display: "block", marginBottom: 4 }}>Output (read-only)</span>
          <textarea className="code" readOnly value={output} aria-label="Generated HTML code" />
        </label>
      </div>
    </section>
  );
}
