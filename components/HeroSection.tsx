'use client'

interface HeroSectionProps {
  onGetStarted: () => void
  totalCredits: number
  totalCO2Offset: number
  totalVolume: number
}

export function HeroSection({ onGetStarted, totalCredits, totalCO2Offset, totalVolume }: HeroSectionProps) {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.1),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.1),transparent_50%)]"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-emerald-500/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-blue-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-purple-500/20 rounded-full blur-xl animate-pulse delay-2000"></div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 text-center">
        {/* Hero Badge */}
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-6 py-2 mb-8">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
          <span className="text-emerald-400 font-medium text-sm">Powered by Symbiotic Protocol</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-8">
          <span className="text-white">Trade </span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600">
            Carbon
          </span>
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600">
            Credits
          </span>
          <span className="text-white"> Securely</span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-white/70 max-w-4xl mx-auto mb-12 leading-relaxed">
          The world's first decentralized carbon credit marketplace secured by{' '}
          <span className="text-emerald-400 font-semibold">Symbiotic's tranche-based vaults</span>.
          Trade verified environmental impact with unprecedented security and transparency.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
          <button
            onClick={onGetStarted}
            className="group bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-4 px-8 rounded-2xl text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/25 flex items-center gap-3"
          >
            <span>🚀</span>
            <span>Connect Wallet & Start Trading</span>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
          
          <button className="group bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 hover:border-white/30 text-white font-semibold py-4 px-8 rounded-2xl text-lg transition-all duration-300 hover:scale-105 flex items-center gap-3">
            <span>📖</span>
            <span>Learn More</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105">
            <div className="text-4xl mb-3">🌍</div>
            <div className="text-3xl font-bold text-emerald-400 mb-2">{totalCredits.toLocaleString()}</div>
            <div className="text-white/60">Verified Carbon Credits</div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105">
            <div className="text-4xl mb-3">♻️</div>
            <div className="text-3xl font-bold text-blue-400 mb-2">{totalCO2Offset.toLocaleString()}t</div>
            <div className="text-white/60">CO₂ Offset</div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105">
            <div className="text-4xl mb-3">💰</div>
            <div className="text-3xl font-bold text-purple-400 mb-2">{totalVolume.toFixed(2)} ETH</div>
            <div className="text-white/60">Trading Volume</div>
          </div>
        </div>

        {/* Features Preview */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <div className="text-center p-6 bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 border border-emerald-500/20 rounded-2xl hover:scale-105 transition-all duration-300">
            <div className="text-3xl mb-4">🛡️</div>
            <h3 className="text-lg font-semibold text-white mb-2">Symbiotic Security</h3>
            <p className="text-white/60 text-sm">Multi-asset staking provides unmatched security for your trades</p>
          </div>
          
          <div className="text-center p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-2xl hover:scale-105 transition-all duration-300">
            <div className="text-3xl mb-4">🏦</div>
            <h3 className="text-lg font-semibold text-white mb-2">Tranche Vaults</h3>
            <p className="text-white/60 text-sm">Choose your risk profile with senior, mezzanine, or junior tranches</p>
          </div>
          
          <div className="text-center p-6 bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-2xl hover:scale-105 transition-all duration-300">
            <div className="text-3xl mb-4">✅</div>
            <h3 className="text-lg font-semibold text-white mb-2">Verified Credits</h3>
            <p className="text-white/60 text-sm">All carbon credits are blockchain-verified for authenticity</p>
          </div>
          
          <div className="text-center p-6 bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-2xl hover:scale-105 transition-all duration-300">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-lg font-semibold text-white mb-2">Real-time Analytics</h3>
            <p className="text-white/60 text-sm">Track market trends and your environmental impact</p>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  )
}