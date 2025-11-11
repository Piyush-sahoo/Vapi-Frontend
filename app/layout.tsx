import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vapi Call Dashboard",
  description: "Make AI-powered voice calls with Vapi + Vobiz",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
