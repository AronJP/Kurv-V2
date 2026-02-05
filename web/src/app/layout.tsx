import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'kurv.fo — Finn bestu tilboðini',
  description: 'Samanber matprísar í Føroyum',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fo">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
