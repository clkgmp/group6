import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { JetBrains_Mono } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { ToastProvider } from "@/components/toast-provider"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "Movie Watchlist",
  description: "Manage your movie watchlist with ease",
  generator: "v0.app",
  manifest: "/manifest.json",
  keywords: ["movie", "watchlist", "entertainment", "tracker", "pwa"],
  authors: [
    {
      name: "Movie Watchlist App",
    },
  ],
  creator: "Movie Watchlist App",
  metadataBase: new URL("https://movie-watchlist.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://movie-watchlist.vercel.app",
    title: "Movie Watchlist",
    description: "Manage your movie watchlist with ease",
    siteName: "Movie Watchlist",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Movie Watchlist App",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Movie Watchlist",
    description: "Manage your movie watchlist with ease",
    images: ["/og-image.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Movie Watchlist",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Movie Watchlist",
    "application-name": "Movie Watchlist",
    "msapplication-TileColor": "#6366f1",
    "msapplication-config": "/browserconfig.xml",
    "theme-color": "#6366f1",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <style>{`
html {
  font-family: ${inter.style.fontFamily};
  --font-sans: ${inter.variable};
  --font-mono: ${jetbrainsMono.variable};
}
        `}</style>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icons/icon-192x192.png" type="image/png" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover"
        />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <ToastProvider />
        </ThemeProvider>
      </body>
    </html>
  )
}
