import './globals.css'
import { Inter } from 'next/font/google'
import { Web3Provider } from '@/components/Web3Provider'
import { Navbar } from '@/components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Carbon Credit Marketplace',
  description: 'Decentralized marketplace for carbon credits on blockchain',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.className} bg-surface`}>
        <Web3Provider>
          <div className="min-h-screen bg-surface">
            <Navbar />
            <main className="container-modern">
              {children}
            </main>
          </div>
        </Web3Provider>
      </body>
    </html>
  )
}