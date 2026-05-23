import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DualLoop // Premium Fullstack Developer Analytics & Diagnostics",
  description: "Secure, multi-tenant developer workspace console. Sync GitHub telemetry, track commit timelines, and explore language distribution metrics under high-fidelity cybernetic diagnostics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className="min-h-full flex flex-col bg-[#030305] text-[#f8fafc] antialiased">
        {children}
      </body>
    </html>
  );
}
