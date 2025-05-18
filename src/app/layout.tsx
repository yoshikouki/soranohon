import "./globals.css";

import type { Metadata } from "next";
import { Geist_Mono, Noto_Sans_JP } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { Footer } from "./footer";
import { Header } from "./header";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-geist-sans", // 互換性のため同じvariable名を使用
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "soranohon",
  description: "Super simple voting app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={cn("antialiased", notoSansJP.variable, geistMono.variable)}>
        <Header />
        {children}
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
