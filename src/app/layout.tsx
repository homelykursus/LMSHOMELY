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
  title: "Homely Kursus Komputer",
  description: "Platform pembelajaran komputer yang modern dan mudah digunakan",
  keywords: ["kursus", "komputer", "pembelajaran", "teknologi", "pendidikan"],
  authors: [{ name: "Homely Team" }],
  icons: {
    icon: [
      {
        url: "https://res.cloudinary.com/dzksnkl72/image/upload/v1770305224/logo_innhbv.jpg",
        sizes: "32x32",
        type: "image/jpeg",
      },
      {
        url: "https://res.cloudinary.com/dzksnkl72/image/upload/v1770305224/logo_innhbv.jpg",
        sizes: "16x16",
        type: "image/jpeg",
      },
    ],
    shortcut: "https://res.cloudinary.com/dzksnkl72/image/upload/v1770305224/logo_innhbv.jpg",
    apple: [
      {
        url: "https://res.cloudinary.com/dzksnkl72/image/upload/v1770305224/logo_innhbv.jpg",
        sizes: "180x180",
        type: "image/jpeg",
      },
    ],
    other: [
      {
        rel: "icon",
        url: "https://res.cloudinary.com/dzksnkl72/image/upload/v1770305224/logo_innhbv.jpg",
      },
    ],
  },
  openGraph: {
    title: "Homely Kursus Komputer",
    description: "Platform pembelajaran komputer yang modern dan mudah digunakan",
    url: "https://homelykursus.com",
    siteName: "Homely Kursus Komputer",
    type: "website",
    images: [
      {
        url: "https://res.cloudinary.com/dzksnkl72/image/upload/v1770305224/logo_innhbv.jpg",
        width: 1200,
        height: 630,
        alt: "Homely Kursus Komputer Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Homely Kursus Komputer",
    description: "Platform pembelajaran komputer yang modern dan mudah digunakan",
    images: ["https://res.cloudinary.com/dzksnkl72/image/upload/v1770305224/logo_innhbv.jpg"],
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
