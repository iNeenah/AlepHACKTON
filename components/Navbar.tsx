'use client'

import { useWeb3 } from '@/components/Web3Provider'

export function Navbar() {
  const { account, connectWallet, disconnect } = useWeb3()

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <nav className="bg-card border-b border-neutral-200 sticky top-0 z-50 backdrop-blur-lg bg-white/90">
      <div className="container-modern">
        <div className="flex justify-between items-center h-16">
          {/* 🏢 Logo profesional */}
          <div className="flex items-center space-x-3">
            <div className="text-2xl">🌱</div>
            <div>
              <span className="text-xl font-bold text-gradient">
                Carbon Credit
              </span>
              <div className="text-sm text-neutral-500 -mt-1">Marketplace</div>
            </div>
          </div>

          {/* 📋 Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#" className="nav-link">
              Marketplace
            </a>
            <a href="#" className="nav-link">
              About
            </a>
            <a href="#" className="nav-link">
              How it Works
            </a>
          </div>

          {/* 💳 Wallet Connection */}
          <div className="flex items-center space-x-4">
            {account ? (
              <div className="flex items-center space-x-3">
                {/* 💵 Account badge */}
                <div className="bg-neutral-100 text-neutral-700 px-4 py-2 rounded-lg font-medium text-sm">
                  🔗 {formatAddress(account)}
                </div>
                
                <button
                  onClick={disconnect}
                  className="btn-secondary text-sm"
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