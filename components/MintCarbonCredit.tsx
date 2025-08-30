'use client'

import { useState } from 'react'
import { ethers } from 'ethers'

interface MintCarbonCreditProps {
  contract: ethers.Contract | null
  onMinted: () => void
}

export function MintCarbonCredit({ contract, onMinted }: MintCarbonCreditProps) {
  const [formData, setFormData] = useState({
    recipient: '',
    carbonAmount: '',
    projectName: '',
    location: '',
    expiryDate: '',
    description: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!contract) {
      alert('Contract not connected')
      return
    }

    try {
      setIsLoading(true)
      
      // Convert expiry date to timestamp
      const expiryTimestamp = Math.floor(new Date(formData.expiryDate).getTime() / 1000)
      
      // Create token URI (metadata)
      const metadata = {
        name: `${formData.projectName} Carbon Credit`,
        description: formData.description,
        image: "https://via.placeholder.com/400x400/10b981/ffffff?text=Carbon+Credit",
        attributes: [
          { trait_type: "Carbon Amount", value: formData.carbonAmount + " tonnes CO2" },
          { trait_type: "Project", value: formData.projectName },
          { trait_type: "Location", value: formData.location },
          { trait_type: "Type", value: "Carbon Credit" }
        ]
      }
      
      // In a real app, you'd upload this to IPFS
      const tokenURI = "data:application/json;base64," + btoa(JSON.stringify(metadata))
      
      // Mint the token
      const tx = await contract.mintCarbonCredit(
        formData.recipient || await contract.runner.getAddress(),
        formData.carbonAmount,
        formData.projectName,
        formData.location,
        expiryTimestamp,
        tokenURI
      )
      
      await tx.wait()
      
      alert('Carbon credit minted successfully!')
      setFormData({
        recipient: '',
        carbonAmount: '',
        projectName: '',
        location: '',
        expiryDate: '',
        description: ''
      })
      
      onMinted()
      
    } catch (error) {
      console.error('Minting failed:', error)
      alert('Minting failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6 card-shadow">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">⚡</div>
          <h3 className="text-xl font-bold text-gray-900">Mint New Carbon Credit</h3>
          <p className="text-gray-600">Create a new verified carbon credit NFT</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Recipient Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recipient Address (optional)
            </label>
            <input
              type="text"
              name="recipient"
              value={formData.recipient}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="0x... (leave empty to mint to yourself)"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty to mint to your own wallet
            </p>
          </div>

          {/* Carbon Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Carbon Amount (tonnes CO₂) *
            </label>
            <input
              type="number"
              name="carbonAmount"
              value={formData.carbonAmount}
              onChange={handleInputChange}
              required
              min="0.1"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="10.5"
            />
          </div>

          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Name *
            </label>
            <input
              type="text"
              name="projectName"
              value={formData.projectName}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Amazon Rainforest Preservation"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location *
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Brazil, South America"
            />
          </div>

          {/* Expiry Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expiry Date *
            </label>
            <input
              type="date"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleInputChange}
              required
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Describe the carbon offset project..."
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-lg font-bold text-white transition-colors ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isLoading ? '⏳ Minting...' : '⚡ Mint Carbon Credit'}
          </button>
        </form>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="text-blue-500 text-xl mr-3">ℹ️</div>
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Note:</p>
              <p>Only authorized verifiers can mint carbon credits. Make sure you have the proper permissions before attempting to mint.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}