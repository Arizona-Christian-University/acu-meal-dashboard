import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ACU Meal Accounting Dashboard",
  description: "Arizona Christian University Meal Plan Analytics Dashboard",
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
