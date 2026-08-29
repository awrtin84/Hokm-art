import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "حکم‌آرت — Hokm Art",
  description: "بازی آنلاین حکم با هوش مصنوعی و چندنفره",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fa" dir="rtl" className="h-full antialiased">
      <body
        className="h-dvh flex flex-col"
        style={{ fontFamily: "var(--font-body)" }}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
