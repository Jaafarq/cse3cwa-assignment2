import "./globals.css";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Moodle HTML Generator",
  description: "Next.js app that outputs HTML5+JS with inline CSS for Moodle"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <a href="#main" className="skip-link">Skip to content</a>
        {/* Student badge (top-left on every page) */}
        <div className="badge" aria-label="Student Number">STUDENT_ID - 22210175</div>
        <Header />
        <main id="main" className="container" role="main" aria-live="polite">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
