'use client'

import { useState } from 'react'
import { ethers } from 'ethers'

interface CarbonCredit {
  tokenId: bigint
  carbonAmount: bigint
  projectName: string
  location: string
  issuanceDate: bigint
  expiryDate: bigint
  verifier: string
  isRetired: boolean
  price: bigint
  isForSale: boolean
  tokenURI?: string
}

interface CarbonCreditCardProps {
  credit: CarbonCredit
  onPurchase?: (tokenId: string, price: string) => void
  onRetire?: (tokenId: string) => void
  onListForSale?: (tokenId: string, price: string) => void
  isOwner: boolean
}

export function CarbonCreditCard({ 
  credit, 
  onPurchase, 
  onRetire, 
  onListForSale, 
  isOwner 
}: CarbonCreditCardProps) {
  const [showListModal, setShowListModal] = useState(false)
  const [listPrice, setListPrice] = useState('')

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleDateString()
  }

  const formatPrice = (price: bigint) => {
    return ethers.formatEther(price)
  }

  const handleListForSale = () => {
    if (listPrice && onListForSale) {
      onListForSale(credit.tokenId.toString(), listPrice)
      setShowListModal(false)
      setListPrice('')
    }
  }

  return (
    <div className="group relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden hover:border-emerald-500/30 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-emerald-500/10">
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Header */}
      <div className="relative bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 p-6 border-b border-white/10">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center text-xl">
                🌱
              </div>
              <div>
                <h3 className="font-bold text-xl text-white">{credit.projectName}</h3>
                <p className="text-emerald-200 text-sm flex items-center gap-2 mt-1">
                  <span>📍</span>
                  {credit.location}
                </p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-emerald-400">{credit.carbonAmount.toString()}t</div>
            <div className="text-emerald-200 text-sm font-medium">CO₂ Offset</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative p-6 space-y-6">
        {/* Status Badge */}
        <div className="flex items-center justify-between">
          <span className="text-white/70 font-medium">Status</span>
          <span className={`px-4 py-2 rounded-xl text-sm font-semibold ${
            credit.isRetired 
              ? 'bg-gray-500/20 text-gray-400 border border-gray-500/30' 
              : credit.isForSale 
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
          }`}>
            {credit.isRetired ? '♻️ Retired' : credit.isForSale ? '🛒 For Sale' : '💎 Available'}
          </span>
        </div>

        {/* Dates */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-white/60 text-sm flex items-center gap-2">
              <span>📅</span>
              Issued
            </span>
            <span className="text-white font-medium">{formatDate(credit.issuanceDate)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/60 text-sm flex items-center gap-2">
              <span>⏰</span>
              Expires
            </span>
            <span className="text-white font-medium">{formatDate(credit.expiryDate)}</span>
          </div>
        </div>

        {/* Price */}
        {credit.isForSale && (
          <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-2xl p-4">
            <div className="flex justify-between items-center">
              <span className="text-blue-400 font-semibold flex items-center gap-2">
                <span>💰</span>
                Price
              </span>
              <div className="text-right">
                <span className="text-3xl font-bold text-blue-400">
                  {formatPrice(credit.price)}
                </span>
                <span className="text-blue-300 text-lg font-semibold ml-2">ETH</span>
              </div>
            </div>
          </div>
        )}

        {/* Token ID */}
        <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl border border-white/10">
          <span className="text-white/60 text-sm flex items-center gap-2">
            <span>🏷️</span>
            Token ID
          </span>
          <span className="font-mono font-bold text-white">#{credit.tokenId.toString()}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="relative p-6 border-t border-white/10">
        {!isOwner && credit.isForSale && onPurchase && (
          <button
            onClick={() => onPurchase(credit.tokenId.toString(), credit.price.toString())}
            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/25 flex items-center justify-center gap-2"
          >
            <span>🛒</span>
            Purchase Credit
          </button>
        )}

        {isOwner && !credit.isRetired && (
          <div className="space-y-3">
            {!credit.isForSale && onListForSale && (
              <button
                onClick={() => setShowListModal(true)}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
              >
                <span>💰</span>
                List for Sale
              </button>
            )}
            
            {onRetire && (
              <button
                onClick={() => onRetire(credit.tokenId.toString())}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
              >
                <span>♻️</span>
                Retire Credit
              </button>
            )}
          </div>
        )}

        {credit.isRetired && (
          <div className="text-center py-6">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 text-emerald-400 rounded-2xl">
              <span className="text-xl">✅</span>
              <span className="font-semibold">Credit Retired - Thank you for offsetting!</span>
            </div>
          </div>
        )}
      </div>

      {/* Modern Modal */}
      {showListModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/20 rounded-3xl max-w-md w-full p-8 shadow-2xl">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
                💰
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">List for Sale</h3>
              <p className="text-white/60">Set a competitive price for your carbon credit</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-white font-semibold mb-3">
                  Price (ETH)
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={listPrice}
                  onChange={(e) => setListPrice(e.target.value)}
                  className="w-full bg-slate-700/50 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="0.1"
                />
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowListModal(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleListForSale}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!listPrice}
                >
                  List Credit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}