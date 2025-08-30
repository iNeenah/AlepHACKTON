'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { CarbonCreditCard } from '@/components/CarbonCreditCard'
import { MintCarbonCredit } from '@/components/MintCarbonCredit'
import { AdvancedStats } from '@/components/AdvancedStats'
import { useNotifications } from '@/components/NotificationSystem'
import { useWeb3 } from '@/hooks/useWeb3'

export default function Home() {
  const { provider, account, contract } = useWeb3()
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

  if (!account) {
    return (
      <div className="hero-section section-padding">
        <div className="text-center max-w-4xl mx-auto slide-up">
          {/* Hero Content */}
          <div className="mb-12">
            <div className="text-6xl mb-6 float">🌱</div>
            <h1 className="text-heading-1 mb-6">
              Carbon Credit <span className="text-gradient">Marketplace</span>
            </h1>
            <p className="text-body text-xl max-w-2xl mx-auto">
              Trade verified carbon credits on blockchain. Make a positive impact on the environment through transparent, immutable transactions.
            </p>
          </div>
          
          {/* Connection Card */}
          <div className="max-w-lg mx-auto mb-16">
            <div className="card-premium p-8">
              <div className="text-5xl mb-6">🔌</div>
              <h2 className="text-heading-3 mb-4">
                Connect Your Wallet
              </h2>
              <p className="text-body mb-8">
                Start your journey towards a sustainable future
              </p>
              
              <div className="grid grid-3 gap-4 mb-8 text-sm">
                <div className="text-center">
                  <div className="text-xl font-bold text-primary">1,247</div>
                  <div className="text-small">Credits</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-success">89,542t</div>
                  <div className="text-small">CO₂ Offset</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-warning">$2.4M</div>
                  <div className="text-small">Volume</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Features */}
          <div className="grid-3 grid-modern">
            <div className="card-modern p-6 text-center">
              <div className="text-3xl mb-4">🔒</div>
              <h3 className="text-heading-3 mb-2">Blockchain Verified</h3>
              <p className="text-body">Authenticated and immutable credits</p>
            </div>
            
            <div className="card-modern p-6 text-center">
              <div className="text-3xl mb-4">🌍</div>
              <h3 className="text-heading-3 mb-2">Global Impact</h3>
              <p className="text-body">Contribute to real environmental projects</p>
            </div>
            
            <div className="card-modern p-6 text-center">
              <div className="text-3xl mb-4">⚡</div>
              <h3 className="text-heading-3 mb-2">Instant Trading</h3>
              <p className="text-body">Buy and sell without intermediaries</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="section-padding">
        {/* Header */}
        <div className="text-center mb-12 slide-up">
          <div className="text-5xl mb-4 float">🌱</div>
          <h1 className="text-heading-1 mb-4">
            Carbon Credit <span className="text-gradient">Marketplace</span>
          </h1>
          <p className="text-body text-lg max-w-2xl mx-auto">
            Trade verified credits • Offset emissions • Build a sustainable future
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid-3 grid-modern mb-12">
          <div className="stats-card text-center">
            <div className="text-3xl mb-2 text-success">🌍</div>
            <h3 className="text-heading-3 text-success">{forSaleCredits.length}</h3>
            <p className="text-small">Available Credits</p>
          </div>
          
          <div className="stats-card text-center">
            <div className="text-3xl mb-2 text-primary">💰</div>
            <h3 className="text-heading-3 text-primary">{userCredits.length}</h3>
            <p className="text-small">Your Portfolio</p>
          </div>
          
          <div className="stats-card text-center">
            <div className="text-3xl mb-2 text-warning">♻️</div>
            <h3 className="text-heading-3 text-warning">
              {userCredits.reduce((sum, credit) => sum + Number(credit.carbonAmount), 0)}t
            </h3>
            <p className="text-small">CO₂ Offset</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-neutral-100 rounded-xl p-1">
            <button
              onClick={() => setActiveTab('marketplace')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'marketplace'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-800'
              }`}
            >
              🛒 Marketplace
            </button>
            <button
              onClick={() => setActiveTab('portfolio')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'portfolio'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-800'
              }`}
            >
              💼 My Portfolio
            </button>
            <button
              onClick={() => setActiveTab('mint')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'mint'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-800'
              }`}
            >
              ⚡ Create Credit
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'stats'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-800'
              }`}
            >
              📊 Analytics
            </button>
          </div>
        </div>

        {/* Content Sections */}
        {activeTab === 'marketplace' && (
          <div className="fade-in">
            <h2 className="text-heading-2 mb-6">Available Credits</h2>
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-body mt-4">Loading credits...</p>
              </div>
            ) : forSaleCredits.length > 0 ? (
              <div className="grid-3 grid-modern">
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
              <div className="card-modern p-12 text-center">
                <div className="text-4xl mb-4">🌱</div>
                <h3 className="text-heading-3 mb-2">No credits available</h3>
                <p className="text-body">Check back later for new verified carbon credits.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'portfolio' && (
          <div className="fade-in">
            <h2 className="text-heading-2 mb-6">Your Carbon Credits</h2>
            {userCredits.length > 0 ? (
              <div className="grid-3 grid-modern">
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
              <div className="card-modern p-12 text-center">
                <div className="text-4xl mb-4">💼</div>
                <h3 className="text-heading-3 mb-2">No credits in portfolio</h3>
                <p className="text-body">Purchase credits from the marketplace to start offsetting your carbon footprint.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'mint' && (
          <div className="fade-in">
            <h2 className="text-heading-2 mb-6 text-center">Create New Carbon Credit</h2>
            <MintCarbonCredit contract={contract} onMinted={loadForSaleCredits} />
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="fade-in">
            <h2 className="text-heading-2 mb-6">Market Analytics</h2>
            <AdvancedStats 
              forSaleCredits={forSaleCredits} 
              userCredits={userCredits} 
              contract={contract} 
            />
          </div>
        )}
      </div>
      
      <NotificationComponent />
    </>
  )
}