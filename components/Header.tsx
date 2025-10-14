"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getCookie, setCookie } from "@/lib/cookies";


const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/escape-room", label: "Escape Room" },
  { href: "/coding-races", label: "Coding Races" },
  { href: "/court-room", label: "Court Room" }
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lastMenu, setLastMenu] = useState<string | null>(null);

  // Remember last menu tab (page) via cookie (navigation memory)
  useEffect(() => {
    setCookie("lastMenu", pathname, 30);
  }, [pathname]);

  useEffect(() => {
    setLastMenu(getCookie("lastMenu"));
  }, []);

  return (
    <header className="header" role="banner">
      <nav className="nav container" aria-label="Primary">
        <div style={{display:"flex", gap:12, alignItems:"center"}}>
          <button
            className="hamburger"
            aria-label="Open menu"
            aria-expanded={open}
            onClick={() => setOpen(v => !v)}
          >
            {/* Kebab/Hamburger icon (accessible) */}
            <span aria-hidden>☰</span>
          </button>
          <strong aria-label="Site title">Moodle HTML Generator</strong>
        </div>

        <div className={`menu ${open ? "open" : ""}`} role="menubar" aria-label="Main menu">
          {links.map(link => {
            const current = pathname === link.href;
            const ariaCurrent = current ? "page" : undefined;
            const remembered = lastMenu === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                role="menuitem"
                aria-current={ariaCurrent}
                style={remembered ? { outline: "2px dashed #2563eb", borderRadius: 6, padding: "2px 6px" } : undefined}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            );
          })}
          <ThemeToggle />
        </div>
      </nav>
      <div className="container" aria-label="Breadcrumbs">
        <Breadcrumbs />
      </div>
    </header>
  );
}
