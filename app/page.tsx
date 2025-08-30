'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { CarbonCreditCard } from '@/components/CarbonCreditCard'
import { MintCarbonCredit } from '@/components/MintCarbonCredit'
import { AdvancedStats } from '@/components/AdvancedStats'
import { VaultInterface } from '@/components/VaultInterface'
import { HeroSection } from '@/components/HeroSection'
import { useNotifications } from '@/components/NotificationSystem'
import { useWeb3 } from '@/hooks/useWeb3'

export default function Home() {
  const { account, contract } = useWeb3()
  const { showSuccess, showError, showInfo, NotificationComponent } = useNotifications()
  const [forSaleCredits, setForSaleCredits] = useState<any[]>([])
  const [userCredits, setUserCredits] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('marketplace')

  useEffect(() => {
    if (contract) {
      loadForSaleCredits()
      if (account) {
        loadUserCredits()
      }
    }
  }, [contract, account])

  const loadForSaleCredits = async () => {
    if (!contract) return
    
    try {
      setLoading(true)
      const tokenIds = await contract.getTokensForSale()
      const credits = []
      
      for (const tokenId of tokenIds) {
        const credit = await contract.getCarbonCredit(tokenId)
        const tokenURI = await contract.tokenURI(tokenId)
        credits.push({ ...credit, tokenURI })
      }
      
      setForSaleCredits(credits)
    } catch (error) {
      console.error('Error loading for sale credits:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUserCredits = async () => {
    if (!contract || !account) return
    
    try {
      const tokenIds = await contract.getTokensByOwner(account)
      const credits = []
      
      for (const tokenId of tokenIds) {
        const credit = await contract.getCarbonCredit(tokenId)
        const tokenURI = await contract.tokenURI(tokenId)
        credits.push({ ...credit, tokenURI })
      }
      
      setUserCredits(credits)
    } catch (error) {
      console.error('Error loading user credits:', error)
    }
  }

  const handlePurchase = async (tokenId: string, price: string) => {
    if (!contract) return
    
    try {
      showInfo('🔄 Processing', 'Purchasing carbon credit...')
      const tx = await contract.buyCarbonCredit(tokenId, { value: price })
      
      showInfo('⏳ Confirming', 'Waiting for blockchain confirmation...')
      await tx.wait()
      
      loadForSaleCredits()
      loadUserCredits()
      
      showSuccess('🎉 Success!', 'Carbon credit purchased successfully!')
    } catch (error) {
      console.error('Purchase failed:', error)
      showError('❌ Error', 'Purchase failed. Please try again.')
    }
  }

  const handleRetire = async (tokenId: string) => {
    if (!contract) return
    
    try {
      showInfo('🔄 Processing', 'Retiring carbon credit...')
      const tx = await contract.retireCarbonCredit(tokenId)
      
      showInfo('⏳ Confirming', 'Waiting for blockchain confirmation...')
      await tx.wait()
      
      loadUserCredits()
      showSuccess('♻️ Retired!', 'Credit retired successfully! Thank you for helping the environment.')
    } catch (error) {
      console.error('Retire failed:', error)
      showError('❌ Error', 'Retirement failed. Please try again.')
    }
  }

  const handleListForSale = async (tokenId: string, price: string) => {
    if (!contract) return
    
    try {
      showInfo('🔄 Processing', 'Listing credit for sale...')
      const priceInWei = ethers.parseEther(price)
      const tx = await contract.listForSale(tokenId, priceInWei)
      
      showInfo('⏳ Confirming', 'Waiting for blockchain confirmation...')
      await tx.wait()
      
      loadForSaleCredits()
      loadUserCredits()
      showSuccess('💰 Listed!', 'Credit listed for sale successfully!')
    } catch (error) {
      console.error('List for sale failed:', error)
      showError('❌ Error', 'Listing failed. Please try again.')
    }
  }

  const handleGetStarted = () => {
    // This will be triggered when user clicks "Get Started" - you might want to show connect wallet modal
    console.log('User wants to get started')
  }

  const totalCredits = forSaleCredits.length + userCredits.length
  const totalCO2Offset = [...forSaleCredits, ...userCredits].reduce((sum, credit) => sum + Number(credit.carbonAmount || 0), 0)
  const totalVolume = forSaleCredits.reduce((sum, credit) => sum + parseFloat(ethers.formatEther(credit.price || 0)), 0)

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Modern Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/90 backdrop-blur-xl border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-xl font-bold">🌱</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Carbon Credit</h1>
                  <p className="text-xs text-emerald-400 -mt-1">Marketplace</p>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="hidden md:flex items-center space-x-8">
                <a href="#" className="text-white/70 hover:text-white transition-colors font-medium">Marketplace</a>
                <a href="#" className="text-white/70 hover:text-white transition-colors font-medium">Analytics</a>
                <a href="#" className="text-white/70 hover:text-white transition-colors font-medium">Vaults</a>
                <a href="#" className="text-white/70 hover:text-white transition-colors font-medium">About</a>
              </div>

              {/* Wallet Connection */}
              <div className="flex items-center space-x-4">
                {account ? (
                  <div className="flex items-center space-x-3">
                    <div className="bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-xl font-medium text-sm border border-emerald-500/30">
                      {account.slice(0, 6)}...{account.slice(-4)}
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleGetStarted}
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
                  >
                    Connect Wallet
                  </button>
                )}
              </div>
            </div>
          </div>
        </nav>

        <main className="pt-16">
          {!account ? (
            <HeroSection 
              onGetStarted={handleGetStarted}
              totalCredits={totalCredits}
              totalCO2Offset={totalCO2Offset}
              totalVolume={totalVolume}
            />
          ) : (
            <div className="min-h-screen">
              <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
                {/* Dashboard Header */}
                <div className="text-center mb-16">
                  <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-6">
                    <span className="text-white">Your </span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">Carbon</span>
                    <span className="text-white"> Dashboard</span>
                  </h1>
                  <p className="text-xl text-white/70 max-w-3xl mx-auto">
                    Trade verified carbon credits, manage your environmental impact, and earn rewards through Symbiotic vaults
                  </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                  <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 backdrop-blur-xl border border-emerald-500/30 rounded-2xl p-6 text-center hover:scale-105 transition-all duration-300">
                    <div className="text-3xl mb-3">🌍</div>
                    <h3 className="text-3xl font-bold text-emerald-400">{forSaleCredits.length}</h3>
                    <p className="text-white/70 text-sm">Available Credits</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-6 text-center hover:scale-105 transition-all duration-300">
                    <div className="text-3xl mb-3">💼</div>
                    <h3 className="text-3xl font-bold text-blue-400">{userCredits.length}</h3>
                    <p className="text-white/70 text-sm">Your Portfolio</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 backdrop-blur-xl border border-orange-500/30 rounded-2xl p-6 text-center hover:scale-105 transition-all duration-300">
                    <div className="text-3xl mb-3">♻️</div>
                    <h3 className="text-3xl font-bold text-orange-400">
                      {userCredits.reduce((sum, credit) => sum + Number(credit.carbonAmount), 0)}t
                    </h3>
                    <p className="text-white/70 text-sm">CO₂ Offset</p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 text-center hover:scale-105 transition-all duration-300">
                    <div className="text-3xl mb-3">💰</div>
                    <h3 className="text-3xl font-bold text-purple-400">{totalVolume.toFixed(2)}</h3>
                    <p className="text-white/70 text-sm">ETH Volume</p>
                  </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex justify-center mb-12">
                  <div className="flex items-center gap-2 rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-white/10 p-2">
                    <button
                      onClick={() => setActiveTab('marketplace')}
                      className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                        activeTab === 'marketplace'
                          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                          : 'text-white/70 hover:text-white hover:bg-slate-700/50'
                      }`}
                    >
                      🛒 Marketplace
                    </button>
                    <button
                      onClick={() => setActiveTab('portfolio')}
                      className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                        activeTab === 'portfolio'
                          ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                          : 'text-white/70 hover:text-white hover:bg-slate-700/50'
                      }`}
                    >
                      💼 Portfolio
                    </button>
                    <button
                      onClick={() => setActiveTab('mint')}
                      className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                        activeTab === 'mint'
                          ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                          : 'text-white/70 hover:text-white hover:bg-slate-700/50'
                      }`}
                    >
                      ⚡ Create
                    </button>
                    <button
                      onClick={() => setActiveTab('vaults')}
                      className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                        activeTab === 'vaults'
                          ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/25'
                          : 'text-white/70 hover:text-white hover:bg-slate-700/50'
                      }`}
                    >
                      🏦 Vaults
                    </button>
                    <button
                      onClick={() => setActiveTab('stats')}
                      className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                        activeTab === 'stats'
                          ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25'
                          : 'text-white/70 hover:text-white hover:bg-slate-700/50'
                      }`}
                    >
                      📊 Analytics
                    </button>
                  </div>
                </div>

                {activeTab === 'marketplace' && (
                  <div className="space-y-8">
                    <div className="text-center">
                      <h2 className="text-4xl font-bold text-white mb-4">🛒 Carbon Credit Marketplace</h2>
                      <p className="text-white/60 text-lg">Discover and purchase verified carbon credits from sustainable projects worldwide</p>
                    </div>
                    
                    {loading ? (
                      <div className="text-center py-20">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
                        <p className="mt-6 text-white/70 text-lg">Loading carbon credits...</p>
                      </div>
                    ) : forSaleCredits.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {forSaleCredits.map((credit, index) => (
                          <CarbonCreditCard
                            key={index}
                            credit={credit}
                            onPurchase={handlePurchase}
                            isOwner={false}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-16 text-center">
                        <div className="text-6xl mb-6">🌱</div>
                        <h3 className="text-3xl font-bold text-white mb-4">No Credits Available</h3>
                        <p className="text-white/60 text-lg max-w-md mx-auto">
                          New verified carbon credits will appear here. Check back soon or create your own!
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'portfolio' && (
                  <div className="space-y-8">
                    <div className="text-center">
                      <h2 className="text-4xl font-bold text-white mb-4">💼 Your Carbon Portfolio</h2>
                      <p className="text-white/60 text-lg">Manage your carbon credits and track your environmental impact</p>
                    </div>
                    
                    {userCredits.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {userCredits.map((credit, index) => (
                          <CarbonCreditCard
                            key={index}
                            credit={credit}
                            onRetire={handleRetire}
                            onListForSale={handleListForSale}
                            isOwner={true}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-16 text-center">
                        <div className="text-6xl mb-6">💼</div>
                        <h3 className="text-3xl font-bold text-white mb-4">Empty Portfolio</h3>
                        <p className="text-white/60 text-lg max-w-md mx-auto mb-8">
                          Start your carbon offset journey by purchasing verified credits from our marketplace.
                        </p>
                        <button
                          onClick={() => setActiveTab('marketplace')}
                          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
                        >
                          Browse Marketplace
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'mint' && (
                  <div className="space-y-8">
                    <div className="text-center">
                      <h2 className="text-4xl font-bold text-white mb-4">⚡ Create Carbon Credit</h2>
                      <p className="text-white/60 text-lg">Mint new verified carbon credits from your environmental projects</p>
                    </div>
                    <MintCarbonCredit contract={contract} onMinted={loadForSaleCredits} />
                  </div>
                )}

                {activeTab === 'vaults' && (
                  <div className="space-y-8">
                    <div className="text-center">
                      <h2 className="text-4xl font-bold text-white mb-4">🏦 Symbiotic Vaults</h2>
                      <p className="text-white/60 text-lg">Stake assets in tranche-based vaults and earn rewards while securing the network</p>
                    </div>
                    <VaultInterface 
                      vaultContract={contract} 
                      account={account} 
                    />
                  </div>
                )}

                {activeTab === 'stats' && (
                  <div className="space-y-8">
                    <div className="text-center">
                      <h2 className="text-4xl font-bold text-white mb-4">📊 Market Analytics</h2>
                      <p className="text-white/60 text-lg">Deep insights into carbon credit trading and market trends</p>
                    </div>
                    <AdvancedStats 
                      forSaleCredits={forSaleCredits} 
                      userCredits={userCredits} 
                      contract={contract} 
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
        
        {/* Modern Footer */}
        <footer className="mt-20 border-t border-white/10 bg-slate-900/50 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Brand */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <span className="text-white text-xl font-bold">🌱</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Carbon Credit</h3>
                    <p className="text-xs text-emerald-400 -mt-1">Marketplace</p>
                  </div>
                </div>
                <p className="text-white/60 text-sm">
                  Building a sustainable future through blockchain-powered carbon credit trading.
                </p>
              </div>

              {/* Links */}
              <div>
                <h4 className="text-white font-semibold mb-4">Platform</h4>
                <div className="space-y-2">
                  <a href="#" className="block text-white/60 hover:text-white transition-colors text-sm">Marketplace</a>
                  <a href="#" className="block text-white/60 hover:text-white transition-colors text-sm">Analytics</a>
                  <a href="#" className="block text-white/60 hover:text-white transition-colors text-sm">Vaults</a>
                  <a href="#" className="block text-white/60 hover:text-white transition-colors text-sm">Documentation</a>
                </div>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-4">Resources</h4>
                <div className="space-y-2">
                  <a href="#" className="block text-white/60 hover:text-white transition-colors text-sm">About</a>
                  <a href="#" className="block text-white/60 hover:text-white transition-colors text-sm">Blog</a>
                  <a href="#" className="block text-white/60 hover:text-white transition-colors text-sm">Help Center</a>
                  <a href="#" className="block text-white/60 hover:text-white transition-colors text-sm">Contact</a>
                </div>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-4">Legal</h4>
                <div className="space-y-2">
                  <a href="#" className="block text-white/60 hover:text-white transition-colors text-sm">Privacy Policy</a>
                  <a href="#" className="block text-white/60 hover:text-white transition-colors text-sm">Terms of Service</a>
                  <a href="#" className="block text-white/60 hover:text-white transition-colors text-sm">Cookie Policy</a>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
              <p className="text-white/50 text-sm">© 2024 Carbon Credit Marketplace. All rights reserved.</p>
              <div className="flex items-center space-x-4 mt-4 md:mt-0">
                <span className="text-white/50 text-sm">Powered by Symbiotic Protocol</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
      <NotificationComponent />
    </>
  )
}
