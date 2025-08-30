import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import "./globals.css"

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Carbon Credit Marketplace - Powered by Symbiotic',
  description: 'A revolutionary decentralized marketplace for verified carbon credits powered by Symbiotic Protocol\'s tranche-based vaults',
  keywords: 'carbon credits, blockchain, symbiotic, defi, environmental, sustainability',
  authors: [{ name: 'Carbon Credit Marketplace Team' }],
  openGraph: {
    title: 'Carbon Credit Marketplace',
    description: 'Trade verified carbon credits on blockchain with Symbiotic security',
    type: 'website',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Carbon Credit Marketplace',
    description: 'Trade verified carbon credits on blockchain with Symbiotic security',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#059669" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          {children}
        </div>
      </body>
    </html>
  )
}