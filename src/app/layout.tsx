import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import ErrorBoundary from "@/components/error-boundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sistem Absensi Karyawan",
  description: "Sistem pencatatan absensi karyawan yang modern dan mudah digunakan",
  keywords: ["absensi", "karyawan", "check in", "check out", "kehadiran"],
  authors: [{ name: "HR Team" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Sistem Absensi Karyawan",
    description: "Sistem pencatatan absensi karyawan yang modern dan mudah digunakan",
    url: "https://chat.z.ai",
    siteName: "Sistem Absensi",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sistem Absensi Karyawan",
    description: "Sistem pencatatan absensi karyawan yang modern dan mudah digunakan",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
        <Toaster />
      </body>
    </html>
  );
}
