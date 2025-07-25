import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import '../lib/server-init'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'HyperLiquid Funding Tracker',
  description: 'Real-time funding rate analytics for HyperLiquid perpetual swaps',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-background">
          {children}
        </div>
      </body>
    </html>
  )
} 