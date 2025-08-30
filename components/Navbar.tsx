'use client'

import { useWeb3 } from '@/components/Web3Provider'

export function Navbar() {
  const { account, connectWallet, disconnect } = useWeb3()

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <nav className="bg-white shadow-lg border-b-2 border-green-100">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="text-2xl">🌱</div>
            <span className="text-xl font-bold text-gray-900">
              Carbon Credit Marketplace
            </span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <a href="#" className="text-gray-600 hover:text-green-600 font-medium">
              Marketplace
            </a>
            <a href="#" className="text-gray-600 hover:text-green-600 font-medium">
              About
            </a>
            <a href="#" className="text-gray-600 hover:text-green-600 font-medium">
              How it Works
            </a>
          </div>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            {account ? (
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  {formatAddress(account)}
                </div>
                <button
                  onClick={disconnect}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="btn-primary"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}