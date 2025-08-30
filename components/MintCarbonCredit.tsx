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
      const provider = contract.runner as ethers.JsonRpcSigner;
      const signerAddress = await provider.getAddress();
      const tx = await contract.mintCarbonCredit(
        formData.recipient || signerAddress,
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
      <div className="card-premium p-8">
        <div className="text-center mb-8">
          <div className="text-4xl mb-4 float">🌱</div>
          <h3 className="text-heading-3 mb-2">
            Create New Carbon Credit
          </h3>
          <p className="text-body">Tokenize your environmental impact on blockchain</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Recipient Address */}
          <div>
            <label className="form-label">
              Recipient Address (optional)
            </label>
            <input
              type="text"
              name="recipient"
              value={formData.recipient}
              onChange={handleInputChange}
              className="form-input"
              placeholder="0x... (leave empty to mint to yourself)"
            />
            <p className="text-small mt-2">
              💡 Leave empty to mint to your own wallet
            </p>
          </div>

          {/* Carbon Amount */}
          <div>
            <label className="form-label">
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
              className="form-input"
              placeholder="10.5"
            />
          </div>

          {/* Project Name */}
          <div>
            <label className="form-label">
              Project Name *
            </label>
            <input
              type="text"
              name="projectName"
              value={formData.projectName}
              onChange={handleInputChange}
              required
              className="form-input"
              placeholder="Amazon Rainforest Preservation"
            />
          </div>

          {/* Location */}
          <div>
            <label className="form-label">
              Location *
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              required
              className="form-input"
              placeholder="Brazil, South America"
            />
          </div>

          {/* Expiry Date */}
          <div>
            <label className="form-label">
              Expiry Date *
            </label>
            <input
              type="date"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleInputChange}
              required
              min={new Date().toISOString().split('T')[0]}
              className="form-input"
            />
          </div>

          {/* Description */}
          <div>
            <label className="form-label">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="form-input resize-none"
              placeholder="Describe the carbon offset project..."
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Creating...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <span>🚀</span> 
                Create Carbon Credit
              </div>
            )}
          </button>
        </form>

        {/* Info Box */}
        <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
          <h4 className="font-semibold text-neutral-800 mb-3 flex items-center gap-2">
            <span>ℹ️</span> Important Information
          </h4>
          <ul className="space-y-2 text-sm text-neutral-600">
            <li className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              Only authorized verifiers can create carbon credits
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              Make sure you have proper permissions before creating
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              Credits are automatically verified by the contract
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}