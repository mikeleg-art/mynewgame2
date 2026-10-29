import type { Metadata, Viewport } from "next";
import { Fredoka } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Blocky Pop! — Cozy Block Puzzle",
  description:
    "The kawaii block puzzle mini app for Telegram. Drag candy blocks, fill lines, pop combos and watch the whole world change color with every blast!",
  keywords: ["Blocky Pop", "block puzzle", "cute game", "kawaii", "Telegram", "mini app", "HTML5 game"],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#ff8cc8",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${fredoka.variable} antialiased`}>
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
        {children}
      </body>
    </html>
  );
}
