import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { DM_Sans, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#000000",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "THE RESETE ORDER",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "THE RESETE ORDER",
  },
  icons: {
    icon: "/shell/icons/icon-192.png",
    apple: "/shell/icons/icon-192.png",
  },
  description: "Comunidad oficial RESET-ORDER: orden, reset y crecimiento.",
  openGraph: {
    title: "RESETE-HUB | RESET-ORDER",
    description: "Comunidad oficial RESET-ORDER: orden, reset y crecimiento.",
    siteName: "RESETE-HUB",
    locale: "es_MX",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RESETE-HUB | RESET-ORDER",
    description: "Comunidad oficial RESET-ORDER: orden, reset y crecimiento.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="stylesheet" href="/shell/shell.css" />
      </head>
      <body className={`${dmSans.variable} ${plusJakarta.variable} antialiased`}>
        <div id="reset-shell-root" />
        {children}
        <Script src="/shell/shell.js" strategy="afterInteractive" />
        <Script id="reset-sw" strategy="afterInteractive">
          {`if ('serviceWorker' in navigator) { window.addEventListener('load', function(){ navigator.serviceWorker.register('/sw.js').catch(function(){}); }); }`}
        </Script>
      </body>
    </html>
  );
}
