import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { Merriweather } from "next/font/google"
import { Fira_Code } from "next/font/google"
import { Providers } from "@/components/providers"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  display: "swap",
  variable: "--font-merriweather",
})

const firaCode = Fira_Code({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fira-code",
})

export const metadata: Metadata = {
  title: "Yugan's Tech Blog",
  description: "A professional personal tech blog by Yugan, covering modern development practices and insights",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${merriweather.variable} ${firaCode.variable} antialiased`}
      suppressHydrationWarning
    >
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
