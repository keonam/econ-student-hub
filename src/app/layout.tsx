import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Econ Student Hub",
  description: "Personal academic and career hub for economics students"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
