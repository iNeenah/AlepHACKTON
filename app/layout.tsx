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
      <body className={inter.className}>
        <Web3Provider>
          <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
              {children}
            </main>
          </div>
        </Web3Provider>
      </body>
    </html>
  )
}