import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ahmed Bashamekh — Software Engineer",
  description:
    "Ahmed Bashamekh is a software engineer in Riyadh, Saudi Arabia, building thoughtful full-stack web products.",
  openGraph: {
    title: "Ahmed Bashamekh — Software Engineer",
    description: "Full-stack software engineer based in Riyadh, Saudi Arabia.",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
