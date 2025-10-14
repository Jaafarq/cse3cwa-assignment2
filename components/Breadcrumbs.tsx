"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Breadcrumbs() {
  const pathname = usePathname();
  const parts = pathname.split("/").filter(Boolean);

  return (
    <nav aria-label="Breadcrumb">
      <ol style={{ display: "flex", gap: 6, listStyle: "none", padding: 0, margin: "0.25rem 0 0.75rem" }}>
        <li>
          <Link href="/">Home</Link>
        </li>
        {parts.map((part, idx) => {
          const href = "/" + parts.slice(0, idx + 1).join("/");
          const last = idx === parts.length - 1;
          return (
            <li key={href} aria-current={last ? "page" : undefined} style={{ display: "flex", gap: 6 }}>
              <span aria-hidden>›</span>
              {last ? <span>{titleCase(part)}</span> : <Link href={href}>{titleCase(part)}</Link>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function titleCase(s: string) {
  return s.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}
