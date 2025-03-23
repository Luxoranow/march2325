import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ThemeRegistry from './theme-registry';
import { EnvironmentProvider } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
});

// Define viewport separately from metadata
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: "Luxora | Digital Business Cards for Modern Networking",
  description: "Elevate your networking with Luxora's sleek digital business cards. Share your professional info instantly with QR codes, custom branding, and analytics.",
  keywords: ["digital business card", "networking", "QR code", "professional profile", "paperless", "contactless"],
  authors: [{ name: "Luxora Team" }],
  creator: "Luxora",
  publisher: "Luxora",
  metadataBase: new URL('https://luxora.io'),
  openGraph: {
    title: "Luxora | Digital Business Cards for Modern Networking",
    description: "Elevate your networking with Luxora's sleek digital business cards. Share your professional info instantly with QR codes, custom branding, and analytics.",
    url: "https://luxora.io",
    siteName: "Luxora",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Luxora Digital Business Cards",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Luxora | Digital Business Cards for Modern Networking",
    description: "Elevate your networking with Luxora's sleek digital business cards. Share your professional info instantly with QR codes, custom branding, and analytics.",
    images: ["/twitter-image.jpg"],
    creator: "@luxoranow",
  },
  robots: {
    index: true,
    follow: true,
  },
  appleWebApp: {
    capable: true,
    title: "Luxora",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: true,
    date: false,
    address: false,
    email: true,
    url: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="format-detection" content="telephone=yes" />
        <meta name="text-size-adjust" content="100%" />
        <meta name="color-scheme" content="light" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeRegistry>
          <EnvironmentProvider>
            {children}
          </EnvironmentProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
