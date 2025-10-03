import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import type React from "react"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Marmitaria",
  description: "Sistema de gerenciamento para marmitaria",
  generator: "marmitaria.ifsp",
  icons: {
    icon: "/images/marmitaria-logo.png",
    apple: "/images/marmitaria-logo.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        <Analytics />
      </body>
    </html>
  )
}
