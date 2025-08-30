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
    <div className="bg-white rounded-lg shadow-lg overflow-hidden card-shadow hover:shadow-xl transition-shadow">
      {/* Header */}
      <div className="gradient-green text-white p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-lg">{credit.projectName}</h3>
            <p className="text-green-100">📍 {credit.location}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{credit.carbonAmount.toString()}t</div>
            <div className="text-green-100 text-sm">CO₂</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Status:</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            credit.isRetired 
              ? 'bg-gray-100 text-gray-800' 
              : credit.isForSale 
                ? 'bg-blue-100 text-blue-800'
                : 'bg-green-100 text-green-800'
          }`}>
            {credit.isRetired ? '♻️ Retired' : credit.isForSale ? '🛒 For Sale' : '💎 Owned'}
          </span>
        </div>

        {/* Dates */}
        <div className="text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-600">Issued:</span>
            <span>{formatDate(credit.issuanceDate)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Expires:</span>
            <span>{formatDate(credit.expiryDate)}</span>
          </div>
        </div>

        {/* Price */}
        {credit.isForSale && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium text-blue-900">Price:</span>
              <span className="text-xl font-bold text-blue-600">
                {formatPrice(credit.price)} ETH
              </span>
            </div>
          </div>
        )}

        {/* Token ID */}
        <div className="text-xs text-gray-500">
          Token ID: #{credit.tokenId.toString()}
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 bg-gray-50 border-t">
        {!isOwner && credit.isForSale && onPurchase && (
          <button
            onClick={() => onPurchase(credit.tokenId.toString(), credit.price.toString())}
            className="w-full btn-primary"
          >
            🛒 Buy Credit
          </button>
        )}

        {isOwner && !credit.isRetired && (
          <div className="space-y-2">
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
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                ♻️ Retire Credit
              </button>
            )}
          </div>
        )}

        {credit.isRetired && (
          <div className="text-center text-gray-500 py-2">
            ✅ This credit has been retired
          </div>
        )}
      </div>

      {/* List for Sale Modal */}
      {showListModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">List Carbon Credit for Sale</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (ETH)
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={listPrice}
                  onChange={(e) => setListPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                  List for Sale
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}