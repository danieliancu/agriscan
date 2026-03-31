import type { Metadata } from "next";
import "../src/index.css";

export const metadata: Metadata = {
  title: "AgriScan",
  description: "AI crop diagnostics for plant health and treatment guidance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
