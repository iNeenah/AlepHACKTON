'use client'

// import { useState } from 'react'

interface HeroSectionProps {
  onGetStarted: () => void
  totalCredits: number
  totalCO2Offset: number
  totalVolume: number
}

export function HeroSection({ onGetStarted, totalCredits, totalCO2Offset, totalVolume }: HeroSectionProps) {
  return (
    <>
      {/* Hero Principal */}
      <section className="relative min-h-[90vh] flex items-center justify-center text-center px-4 overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 z-10 opacity-80"></div>
        
        {/* Animated Background Elements */}
        <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-emerald-500/20 rounded-full blur-[150px] float"></div>
        <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-blue-500/20 rounded-full blur-[150px] float" style={{animationDelay: '3s'}}></div>
        <div className="absolute top-1/3 right-1/4 w-1/3 h-1/3 bg-orange-500/15 rounded-full blur-[120px] float" style={{animationDelay: '1.5s'}}></div>
        
        {/* Content */}
        <div className="relative z-20 max-w-5xl mx-auto flex flex-col items-center gap-8">
          <div className="text-6xl mb-4 float">🌱</div>
          
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-100 to-emerald-200">
            Carbon Credit Marketplace
          </h1>
          
          <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">
            Powered by Symbiotic Protocol
          </h2>
          
          <p className="text-lg md:text-xl text-white/80 max-w-3xl leading-relaxed">
            Experience the future of environmental finance with our blockchain-powered marketplace. 
            Trade verified carbon credits backed by Symbiotic&apos;s tranche-based vaults with unprecedented security and transparency.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <button 
              onClick={onGetStarted}
              className="group relative overflow-hidden bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/25"
            >
              <span className="relative z-10 flex items-center gap-2">
                🌍 Explore Marketplace
              </span>
            </button>
            
            <button className="group relative overflow-hidden bg-slate-800/80 hover:bg-slate-700/80 border border-white/20 hover:border-blue-400/40 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105">
              <span className="relative z-10 flex items-center gap-2">
                📊 View Analytics
              </span>
            </button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 w-full max-w-4xl">
            <div className="bg-slate-900/60 backdrop-blur-lg border border-white/10 rounded-2xl p-6 text-center hover:border-emerald-500/30 transition-all duration-300">
              <div className="text-3xl font-black text-emerald-400">{totalCredits}</div>
              <div className="text-white/70 text-sm uppercase tracking-wide">Carbon Credits</div>
            </div>
            
            <div className="bg-slate-900/60 backdrop-blur-lg border border-white/10 rounded-2xl p-6 text-center hover:border-blue-500/30 transition-all duration-300">
              <div className="text-3xl font-black text-blue-400">{totalCO2Offset}t</div>
              <div className="text-white/70 text-sm uppercase tracking-wide">CO₂ Offset</div>
            </div>
            
            <div className="bg-slate-900/60 backdrop-blur-lg border border-white/10 rounded-2xl p-6 text-center hover:border-orange-500/30 transition-all duration-300">
              <div className="text-3xl font-black text-orange-400">{totalVolume.toFixed(2)} ETH</div>
              <div className="text-white/70 text-sm uppercase tracking-wide">Total Volume</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-20 md:px-10 md:py-32 bg-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-white">Revolutionary Features</h2>
            <p className="text-lg text-white/60 mt-4 max-w-3xl mx-auto">
              Our platform combines cutting-edge blockchain technology with Symbiotic&apos;s security infrastructure to deliver unmatched carbon credit trading experiences.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group bg-slate-900/50 p-8 rounded-2xl border border-white/10 card-gradient transition-all duration-300 hover:border-emerald-500 hover:-translate-y-2">
              <div className="text-emerald-500 mb-4 text-4xl">🔒</div>
              <h3 className="text-xl font-bold mb-2 text-white">Symbiotic Security</h3>
              <p className="text-white/70">Multi-asset staking vaults provide unprecedented security for carbon credit verification and trading.</p>
            </div>
            
            <div className="group bg-slate-900/50 p-8 rounded-2xl border border-white/10 card-gradient transition-all duration-300 hover:border-blue-500 hover:-translate-y-2">
              <div className="text-blue-500 mb-4 text-4xl">🏦</div>
              <h3 className="text-xl font-bold mb-2 text-white">Tranche-Based Vaults</h3>
              <p className="text-white/70">Choose your risk profile with Junior, Mezzanine, or Senior tranches for optimized yields.</p>
            </div>
            
            <div className="group bg-slate-900/50 p-8 rounded-2xl border border-white/10 card-gradient transition-all duration-300 hover:border-orange-500 hover:-translate-y-2">
              <div className="text-orange-500 mb-4 text-4xl">🌐</div>
              <h3 className="text-xl font-bold mb-2 text-white">Cross-Chain Trading</h3>
              <p className="text-white/70">Seamlessly trade carbon credits across multiple blockchains with universal staking security.</p>
            </div>
            
            <div className="group bg-slate-900/50 p-8 rounded-2xl border border-white/10 card-gradient transition-all duration-300 hover:border-purple-500 hover:-translate-y-2">
              <div className="text-purple-500 mb-4 text-4xl">📊</div>
              <h3 className="text-xl font-bold mb-2 text-white">Real-Time Analytics</h3>
              <p className="text-white/70">Advanced analytics and insights powered by transparent blockchain data and smart contracts.</p>
            </div>
            
            <div className="group bg-slate-900/50 p-8 rounded-2xl border border-white/10 card-gradient transition-all duration-300 hover:border-cyan-500 hover:-translate-y-2">
              <div className="text-cyan-500 mb-4 text-4xl">♻️</div>
              <h3 className="text-xl font-bold mb-2 text-white">Verified Impact</h3>
              <p className="text-white/70">Every carbon credit is verified and tracked on-chain, ensuring authentic environmental impact.</p>
            </div>
            
            <div className="group bg-slate-900/50 p-8 rounded-2xl border border-white/10 card-gradient transition-all duration-300 hover:border-green-500 hover:-translate-y-2">
              <div className="text-green-500 mb-4 text-4xl">⚡</div>
              <h3 className="text-xl font-bold mb-2 text-white">Instant Settlement</h3>
              <p className="text-white/70">Fast and efficient trading with minimal gas costs and instant settlement mechanisms.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Symbiotic Explanation Section */}
      <section className="px-4 py-20 md:px-10 md:py-32 bg-slate-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-white">How Symbiotic Powers Our Platform</h2>
            <p className="text-lg text-white/60 mt-4 max-w-3xl mx-auto">
              Understanding the revolutionary technology behind our carbon credit marketplace.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shrink-0">1</div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Multi-Asset Staking</h3>
                  <p className="text-white/70">Stake various assets (ETH, stablecoins, LSTs) into Symbiotic vaults that secure our carbon credit verification network.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shrink-0">2</div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Risk Tranches</h3>
                  <p className="text-white/70">Choose between Senior (low risk), Mezzanine (medium risk), or Junior (high yield) tranches based on your investment strategy.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shrink-0">3</div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Shared Security</h3>
                  <p className="text-white/70">Economic security from staked assets protects carbon credit authenticity and cross-chain transactions.</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-3xl border border-white/10">
              <div className="text-center mb-6">
                <div className="text-5xl mb-4">🏛️</div>
                <h3 className="text-2xl font-bold text-white mb-2">Symbiotic Vault Architecture</h3>
                <p className="text-white/60">Structured security for environmental finance</p>
              </div>
              
              <div className="space-y-4">
                <div className="bg-slate-700/50 p-4 rounded-xl border border-emerald-500/20">
                  <div className="flex justify-between items-center">
                    <span className="text-emerald-400 font-semibold">Senior Tranche</span>
                    <span className="text-white/70">3-5% APY</span>
                  </div>
                  <div className="text-sm text-white/60 mt-1">Low risk, priority withdrawals</div>
                </div>
                
                <div className="bg-slate-700/50 p-4 rounded-xl border border-blue-500/20">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-400 font-semibold">Mezzanine Tranche</span>
                    <span className="text-white/70">6-8% APY</span>
                  </div>
                  <div className="text-sm text-white/60 mt-1">Medium risk, balanced returns</div>
                </div>
                
                <div className="bg-slate-700/50 p-4 rounded-xl border border-orange-500/20">
                  <div className="flex justify-between items-center">
                    <span className="text-orange-400 font-semibold">Junior Tranche</span>
                    <span className="text-white/70">10-15% APY</span>
                  </div>
                  <div className="text-sm text-white/60 mt-1">Higher risk, maximum yield</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}