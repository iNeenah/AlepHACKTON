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
    <div className="max-w-4xl mx-auto">
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-6 float">
            🌱
          </div>
          <h3 className="text-3xl font-bold text-white mb-3">
            Create Carbon Credit NFT
          </h3>
          <p className="text-white/60 text-lg">Tokenize your environmental impact and contribute to a sustainable future</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Recipient Address */}
            <div>
              <label className="block text-white font-semibold mb-3 flex items-center gap-2">
                <span>👤</span>
                Recipient Address
              </label>
              <input
                type="text"
                name="recipient"
                value={formData.recipient}
                onChange={handleInputChange}
                className="w-full bg-slate-700/50 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:border-emerald-500 focus:outline-none transition-colors"
                placeholder="0x... (leave empty to mint to yourself)"
              />
              <p className="text-emerald-400 text-sm mt-2 flex items-center gap-2">
                <span>💡</span>
                Leave empty to mint to your own wallet
              </p>
            </div>

            {/* Carbon Amount */}
            <div>
              <label className="block text-white font-semibold mb-3 flex items-center gap-2">
                <span>♻️</span>
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
                className="w-full bg-slate-700/50 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:border-emerald-500 focus:outline-none transition-colors"
                placeholder="10.5"
              />
            </div>

            {/* Project Name */}
            <div>
              <label className="block text-white font-semibold mb-3 flex items-center gap-2">
                <span>🏗️</span>
                Project Name *
              </label>
              <input
                type="text"
                name="projectName"
                value={formData.projectName}
                onChange={handleInputChange}
                required
                className="w-full bg-slate-700/50 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:border-emerald-500 focus:outline-none transition-colors"
                placeholder="Amazon Rainforest Preservation"
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Location */}
            <div>
              <label className="block text-white font-semibold mb-3 flex items-center gap-2">
                <span>📍</span>
                Location *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
                className="w-full bg-slate-700/50 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:border-emerald-500 focus:outline-none transition-colors"
                placeholder="Brazil, South America"
              />
            </div>

            {/* Expiry Date */}
            <div>
              <label className="block text-white font-semibold mb-3 flex items-center gap-2">
                <span>📅</span>
                Expiry Date *
              </label>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleInputChange}
                required
                min={new Date().toISOString().split('T')[0]}
                className="w-full bg-slate-700/50 border border-white/20 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-white font-semibold mb-3 flex items-center gap-2">
                <span>📝</span>
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full bg-slate-700/50 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:border-emerald-500 focus:outline-none transition-colors resize-none"
                placeholder="Describe the carbon offset project and its environmental impact..."
              />
            </div>
          </div>

          {/* Submit Button - Full Width */}
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                  <span>Creating Carbon Credit...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3 text-lg">
                  <span>🚀</span> 
                  <span>Create Carbon Credit NFT</span>
                </div>
              )}
            </button>
          </div>
        </form>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-2xl p-6 text-center">
            <div className="text-3xl mb-3">🔒</div>
            <h4 className="text-blue-400 font-semibold mb-2">Verified Only</h4>
            <p className="text-white/60 text-sm">Only authorized verifiers can create carbon credits</p>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 rounded-2xl p-6 text-center">
            <div className="text-3xl mb-3">⚡</div>
            <h4 className="text-emerald-400 font-semibold mb-2">Instant Minting</h4>
            <p className="text-white/60 text-sm">Credits are automatically verified by smart contract</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-2xl p-6 text-center">
            <div className="text-3xl mb-3">🌍</div>
            <h4 className="text-purple-400 font-semibold mb-2">Global Impact</h4>
            <p className="text-white/60 text-sm">Contribute to worldwide carbon offset initiatives</p>
          </div>
        </div>
      </div>
    </div>
  )
}