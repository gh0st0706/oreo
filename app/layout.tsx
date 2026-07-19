import type { Metadata } from "next";
import { Fraunces } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  weight: "500",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "For Meg",
  description: "A little place to breathe.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={fraunces.className}>
        {children}
      </body>
    </html>
  );
}