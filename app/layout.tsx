import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "嘉玮健身志｜训练、体重与饮食打卡",
  description: "简单清晰的个人健身打卡工具，记录每天的训练、体重和饮食。",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
