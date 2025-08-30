'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { CarbonCreditCard } from '@/components/CarbonCreditCard'
import { MintCarbonCredit } from '@/components/MintCarbonCredit'
import { useWeb3 } from '@/hooks/useWeb3'

export default function Home() {
  const { provider, account, contract } = useWeb3()
  const [forSaleCredits, setForSaleCredits] = useState([])
  const [userCredits, setUserCredits] = useState([])
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
      const tx = await contract.buyCarbonCredit(tokenId, { value: price })
      await tx.wait()
      
      // Refresh data
      loadForSaleCredits()
      loadUserCredits()
      
      alert('Carbon credit purchased successfully!')
    } catch (error) {
      console.error('Purchase failed:', error)
      alert('Purchase failed. Please try again.')
    }
  }

  const handleRetire = async (tokenId: string) => {
    if (!contract) return
    
    try {
      const tx = await contract.retireCarbonCredit(tokenId)
      await tx.wait()
      
      loadUserCredits()
      alert('Carbon credit retired successfully!')
    } catch (error) {
      console.error('Retire failed:', error)
      alert('Retire failed. Please try again.')
    }
  }

  const handleListForSale = async (tokenId: string, price: string) => {
    if (!contract) return
    
    try {
      const priceInWei = ethers.parseEther(price)
      const tx = await contract.listForSale(tokenId, priceInWei)
      await tx.wait()
      
      loadForSaleCredits()
      loadUserCredits()
      alert('Carbon credit listed for sale!')
    } catch (error) {
      console.error('List for sale failed:', error)
      alert('Listing failed. Please try again.')
    }
  }

  if (!account) {
    return (
      <div className="text-center py-20">
        <div className="max-w-md mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🌱 Carbon Credit Marketplace
            </h1>
            <p className="text-lg text-gray-600">
              Trade verified carbon credits on the blockchain and make a positive impact on the environment
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6 card-shadow">
            <h2 className="text-xl font-semibold mb-4">Connect Your Wallet</h2>
            <p className="text-gray-600 mb-4">
              Please connect your wallet to start trading carbon credits
            </p>
            <div className="text-2xl">🔌</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🌱 Carbon Credit Marketplace
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Trade verified carbon credits, offset your emissions, and contribute to a sustainable future
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6 card-shadow">
          <div className="flex items-center">
            <div className="text-3xl mr-4">🌍</div>
            <div>
              <h3 className="text-lg font-semibold">Credits Available</h3>
              <p className="text-2xl font-bold text-green-600">{forSaleCredits.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6 card-shadow">
          <div className="flex items-center">
            <div className="text-3xl mr-4">💰</div>
            <div>
              <h3 className="text-lg font-semibold">Your Credits</h3>
              <p className="text-2xl font-bold text-blue-600">{userCredits.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6 card-shadow">
          <div className="flex items-center">
            <div className="text-3xl mr-4">♻️</div>
            <div>
              <h3 className="text-lg font-semibold">CO2 Offset</h3>
              <p className="text-2xl font-bold text-purple-600">
                {userCredits.reduce((sum, credit) => sum + Number(credit.carbonAmount), 0)}t
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-lg card-shadow">
        <button
          onClick={() => setActiveTab('marketplace')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'marketplace'
              ? 'bg-green-600 text-white'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          🛒 Marketplace
        </button>
        <button
          onClick={() => setActiveTab('my-credits')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'my-credits'
              ? 'bg-green-600 text-white'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📜 My Credits
        </button>
        <button
          onClick={() => setActiveTab('mint')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'mint'
              ? 'bg-green-600 text-white'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          ⚡ Mint New
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'marketplace' && (
        <div>
          <h2 className="text-2xl font-bold mb-6">🛒 Available Carbon Credits</h2>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : forSaleCredits.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {forSaleCredits.map((credit) => (
                <CarbonCreditCard
                  key={credit.tokenId.toString()}
                  credit={credit}
                  onPurchase={handlePurchase}
                  isOwner={false}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No carbon credits available for purchase
            </div>
          )}
        </div>
      )}

      {activeTab === 'my-credits' && (
        <div>
          <h2 className="text-2xl font-bold mb-6">📜 Your Carbon Credits</h2>
          {userCredits.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userCredits.map((credit) => (
                <CarbonCreditCard
                  key={credit.tokenId.toString()}
                  credit={credit}
                  onRetire={handleRetire}
                  onListForSale={handleListForSale}
                  isOwner={true}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              You don't own any carbon credits yet
            </div>
          )}
        </div>
      )}

      {activeTab === 'mint' && (
        <div>
          <h2 className="text-2xl font-bold mb-6">⚡ Mint New Carbon Credit</h2>
          <MintCarbonCredit 
            contract={contract} 
            onMinted={() => {
              loadForSaleCredits()
              loadUserCredits()
            }}
          />
        </div>
      )}
    </div>
  )
}