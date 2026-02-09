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
  title: "Kursus Komputer Pekanbaru Bersertifikat | Homely Kursus Komputer",
  description: "Tempat Kursus Komputer Terbaik di Pekanbaru ✓ Microsoft Office ✓ Desain Grafis ✓ Video Editing ✓ Web Design ✓ Digital Marketing ✓ Bersertifikat ✓ Kelas Kecil ✓ Instruktur Berpengalaman ✓ Jadwal Fleksibel ✓ Lokasi Strategis di Pekanbaru",
  keywords: [
    "kursus komputer pekanbaru",
    "tempat kursus komputer di pekanbaru",
    "les komputer pekanbaru",
    "kursus microsoft office pekanbaru",
    "kursus desain grafis pekanbaru",
    "kursus video editing pekanbaru",
    "kursus web design pekanbaru",
    "kursus digital marketing pekanbaru",
    "kursus komputer bersertifikat pekanbaru",
    "pelatihan komputer pekanbaru",
    "kursus excel pekanbaru",
    "kursus photoshop pekanbaru",
    "kursus komputer murah pekanbaru",
    "les komputer untuk pemula pekanbaru",
    "kursus komputer terbaik pekanbaru"
  ],
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
    title: "Kursus Komputer Pekanbaru Bersertifikat | Homely Kursus Komputer",
    description: "Tempat Kursus Komputer Terbaik di Pekanbaru ✓ Microsoft Office ✓ Desain Grafis ✓ Video Editing ✓ Bersertifikat ✓ Kelas Kecil ✓ Instruktur Berpengalaman",
    url: "https://homelykursus.com",
    siteName: "Homely Kursus Komputer Pekanbaru",
    type: "website",
    locale: "id_ID",
    images: [
      {
        url: "https://res.cloudinary.com/dzksnkl72/image/upload/v1770305224/logo_innhbv.jpg",
        width: 1200,
        height: 630,
        alt: "Kursus Komputer Pekanbaru - Homely Kursus Komputer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kursus Komputer Pekanbaru Bersertifikat | Homely",
    description: "Tempat Kursus Komputer Terbaik di Pekanbaru ✓ Microsoft Office ✓ Desain Grafis ✓ Video Editing ✓ Bersertifikat",
    images: ["https://res.cloudinary.com/dzksnkl72/image/upload/v1770305224/logo_innhbv.jpg"],
  },
  alternates: {
    canonical: "https://homelykursus.com",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              "name": "Homely Kursus Komputer",
              "alternateName": "Kursus Komputer Pekanbaru",
              "url": "https://homelykursus.com",
              "logo": "https://res.cloudinary.com/dzksnkl72/image/upload/v1770305224/logo_innhbv.jpg",
              "description": "Tempat Kursus Komputer Terbaik di Pekanbaru dengan program Microsoft Office, Desain Grafis, Video Editing, Web Design, dan Digital Marketing. Bersertifikat dengan instruktur berpengalaman.",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Pekanbaru",
                "addressRegion": "Riau",
                "addressCountry": "ID"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": "0.5071",
                "longitude": "101.4478"
              },
              "telephone": "+62-821-6457-578",
              "priceRange": "$$",
              "areaServed": {
                "@type": "City",
                "name": "Pekanbaru"
              },
              "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "Program Kursus Komputer",
                "itemListElement": [
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Course",
                      "name": "Kursus Microsoft Office",
                      "description": "Kursus Microsoft Office untuk Sekolah dan Perkantoran",
                      "provider": {
                        "@type": "Organization",
                        "name": "Homely Kursus Komputer"
                      }
                    }
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Course",
                      "name": "Kursus Desain Grafis",
                      "description": "Kursus Desain Grafis untuk peningkatan skill",
                      "provider": {
                        "@type": "Organization",
                        "name": "Homely Kursus Komputer"
                      }
                    }
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Course",
                      "name": "Kursus Video Editing",
                      "description": "Kursus Video Editing untuk Content Creator",
                      "provider": {
                        "@type": "Organization",
                        "name": "Homely Kursus Komputer"
                      }
                    }
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Course",
                      "name": "Kursus Web Design",
                      "description": "Kursus Pembuatan Website dengan Wordpress dan AI",
                      "provider": {
                        "@type": "Organization",
                        "name": "Homely Kursus Komputer"
                      }
                    }
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Course",
                      "name": "Kursus Digital Marketing",
                      "description": "Kursus Digital Marketing dan Iklan Sosial Media",
                      "provider": {
                        "@type": "Organization",
                        "name": "Homely Kursus Komputer"
                      }
                    }
                  }
                ]
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "5",
                "reviewCount": "8"
              }
            })
          }}
        />
      </head>
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
