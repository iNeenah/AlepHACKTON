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
    <div className="card-modern group">
      {/* Header */}
      <div className="bg-gradient-primary text-white p-6 rounded-t-xl">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="text-2xl">🌱</div>
              <h3 className="font-bold text-lg">{credit.projectName}</h3>
            </div>
            <p className="text-blue-100 flex items-center gap-2">
              <span>📍</span>
              {credit.location}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{credit.carbonAmount.toString()}t</div>
            <div className="text-blue-100 text-sm">CO₂ Offset</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Status */}
        <div className="flex items-center justify-between">
          <span className="text-small font-medium">Status:</span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            credit.isRetired 
              ? 'bg-neutral-200 text-neutral-700' 
              : credit.isForSale 
                ? 'bg-blue-100 text-blue-700'
                : 'bg-emerald-100 text-emerald-700'
          }`}>
            {credit.isRetired ? '♻️ Retired' : credit.isForSale ? '🛒 For Sale' : '💎 Available'}
          </span>
        </div>

        {/* Dates */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-neutral-500">📅 Issued:</span>
            <span className="font-medium">{formatDate(credit.issuanceDate)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-neutral-500">⏰ Expires:</span>
            <span className="font-medium">{formatDate(credit.expiryDate)}</span>
          </div>
        </div>

        {/* Price */}
        {credit.isForSale && (
          <div className="bg-neutral-50 p-4 rounded-lg border">
            <div className="flex justify-between items-center">
              <span className="font-medium text-neutral-700">💰 Price:</span>
              <div className="text-right">
                <span className="text-2xl font-bold text-primary">
                  {formatPrice(credit.price)}
                </span>
                <span className="text-primary text-sm font-medium ml-1">ETH</span>
              </div>
            </div>
          </div>
        )}

        {/* Token ID */}
        <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg text-sm">
          <span className="text-neutral-500">🏷️ Token ID:</span>
          <span className="font-mono font-medium">#{credit.tokenId.toString()}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="p-6 bg-neutral-50 border-t rounded-b-xl">
        {!isOwner && credit.isForSale && onPurchase && (
          <button
            onClick={() => onPurchase(credit.tokenId.toString(), credit.price.toString())}
            className="w-full btn-primary"
          >
            🛒 Purchase Credit
          </button>
        )}

        {isOwner && !credit.isRetired && (
          <div className="space-y-3">
            {!credit.isForSale && onListForSale && (
              <button
                onClick={() => setShowListModal(true)}
                className="w-full btn-secondary"
              >
                💰 List for Sale
              </button>
            )}
            
            {onRetire && (
              <button
                onClick={() => onRetire(credit.tokenId.toString())}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                ♻️ Retire Credit
              </button>
            )}
          </div>
        )}

        {credit.isRetired && (
          <div className="text-center py-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <span>✅</span>
              <span className="font-medium">This credit has been retired</span>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showListModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card-modern max-w-md w-full mx-4 p-6">
            <div className="text-center mb-6">
              <div className="text-3xl mb-2">💰</div>
              <h3 className="text-heading-3">List for Sale</h3>
              <p className="text-body">Set a price for your carbon credit</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="form-label">
                  Price (ETH)
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={listPrice}
                  onChange={(e) => setListPrice(e.target.value)}
                  className="form-input"
                  placeholder="0.1"
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowListModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleListForSale}
                  className="flex-1 btn-primary"
                  disabled={!listPrice}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}