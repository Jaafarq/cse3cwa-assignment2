"use client";
import useSWR from "swr";

const fetcher = (u: string) => fetch(u).then(r => r.json());

export default function OutputsPage() {
  const { data, mutate } = useSWR("/api/outputs", fetcher);

  const del = async (id: string) => {
    await fetch(`/api/outputs/${id}`, { method: "DELETE" });
    mutate();
  };

  return (
    <section>
      <h1>Saved Outputs</h1>
      {!data ? <p>Loading…</p> : (
        <ul style={{ padding: 0, listStyle: "none", display: "grid", gap: 12 }}>
          {data.map((o: any) => (
            <li key={o.id} className="card">
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <strong>{o.title}</strong><br />
                  <small>{new Date(o.createdAt).toLocaleString()}</small>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <a href={`/share/${o.id}`} style={{ border: "1px solid var(--border)", borderRadius: 8, padding: "6px 10px" }}>Open</a>
                  <button onClick={() => del(o.id)} style={{ border: "1px solid var(--border)", borderRadius: 8, padding: "6px 10px" }}>
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
          {data.length === 0 && <p>No outputs saved yet.</p>}
        </ul>
      )}
    </section>
  );
}
