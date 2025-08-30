'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'

interface TrancheInfo {
  name: string
  type: 'SENIOR' | 'MEZZANINE' | 'JUNIOR'
  totalDeposited: string
  totalShares: string
  targetAllocation: number
  currentAPY: number
  lockupPeriod: number
  acceptingDeposits: boolean
  riskLevel: 'Low' | 'Medium' | 'High'
  description: string
  color: string
  icon: string
}

interface UserPosition {
  seniorShares: string
  mezzanineShares: string
  juniorShares: string
  totalValue: string
  totalRewardsClaimed: string
}

interface VaultInterfaceProps {
  vaultContract: ethers.Contract | null
  account: string | null
}

export function VaultInterface({ vaultContract, account }: VaultInterfaceProps) {
  const [trancheData, setTrancheData] = useState<TrancheInfo[]>([])
  const [userPosition, setUserPosition] = useState<UserPosition | null>(null)
  const [selectedTranche, setSelectedTranche] = useState<TrancheInfo | null>(null)
  const [depositAmount, setDepositAmount] = useState('')
  const [withdrawShares, setWithdrawShares] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('deposit')

  const trancheTemplates: TrancheInfo[] = [
    {
      name: 'Senior Tranche',
      type: 'SENIOR',
      totalDeposited: '0',
      totalShares: '0',
      targetAllocation: 40,
      currentAPY: 0,
      lockupPeriod: 30,
      acceptingDeposits: true,
      riskLevel: 'Low',
      description: 'Stable returns with priority in withdrawals and protection against small slashes',
      color: 'emerald',
      icon: '🛡️'
    },
    {
      name: 'Mezzanine Tranche',
      type: 'MEZZANINE',
      totalDeposited: '0',
      totalShares: '0',
      targetAllocation: 35,
      currentAPY: 0,
      lockupPeriod: 15,
      acceptingDeposits: true,
      riskLevel: 'Medium',
      description: 'Balanced risk-reward with medium exposure to slashing events',
      color: 'blue',
      icon: '⚖️'
    },
    {
      name: 'Junior Tranche',
      type: 'JUNIOR',
      totalDeposited: '0',
      totalShares: '0',
      targetAllocation: 25,
      currentAPY: 0,
      lockupPeriod: 7,
      acceptingDeposits: true,
      riskLevel: 'High',
      description: 'Maximum yield potential but absorbs slashing losses first',
      color: 'orange',
      icon: '🚀'
    }
  ]

  useEffect(() => {
    if (vaultContract && account) {
      loadVaultData()
    }
  }, [vaultContract, account])

  const loadVaultData = async () => {
    if (!vaultContract) return

    try {
      setLoading(true)
      
      // Load tranche data
      const updatedTranches = await Promise.all(
        trancheTemplates.map(async (template, index) => {
          try {
            const trancheInfo = await vaultContract.getTrancheInfo(index)
            return {
              ...template,
              totalDeposited: ethers.formatEther(trancheInfo.totalDeposited || '0'),
              totalShares: ethers.formatEther(trancheInfo.totalShares || '0'),
              targetAllocation: Number(trancheInfo.targetAllocation || 0) / 100,
              currentAPY: Number(trancheInfo.currentAPY || 0) / 100,
              lockupPeriod: Number(trancheInfo.lockupPeriod || 0) / 6646, // Convert blocks to days
              acceptingDeposits: trancheInfo.acceptingDeposits || true
            }
          } catch (error) {
            console.log(`Tranche ${index} not available:`, error)
            return template
          }
        })
      )

      setTrancheData(updatedTranches)

      // Load user position if account is connected
      if (account) {
        try {
          const position = await vaultContract.getUserPosition(account)
          setUserPosition({
            seniorShares: ethers.formatEther(position.seniorShares || '0'),
            mezzanineShares: ethers.formatEther(position.mezzanineShares || '0'),
            juniorShares: ethers.formatEther(position.juniorShares || '0'),
            totalValue: ethers.formatEther(position.totalValue || '0'),
            totalRewardsClaimed: ethers.formatEther(position.totalRewardsClaimed || '0')
          })
        } catch (error) {
          console.log('User position not available:', error)
          setUserPosition({
            seniorShares: '0',
            mezzanineShares: '0',
            juniorShares: '0',
            totalValue: '0',
            totalRewardsClaimed: '0'
          })
        }
      }

    } catch (error) {
      console.error('Error loading vault data:', error)
      setTrancheData(trancheTemplates)
    } finally {
      setLoading(false)
    }
  }

  const handleDeposit = async () => {
    if (!vaultContract || !selectedTranche || !depositAmount) return

    try {
      setLoading(true)
      const amount = ethers.parseEther(depositAmount)
      const trancheIndex = trancheTemplates.findIndex(t => t.type === selectedTranche.type)
      
      const tx = await vaultContract.deposit(trancheIndex, amount)
      await tx.wait()
      
      await loadVaultData()
      setDepositAmount('')
      alert('Deposit successful!')
    } catch (error) {
      console.error('Deposit failed:', error)
      alert('Deposit failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleWithdraw = async () => {
    if (!vaultContract || !selectedTranche || !withdrawShares) return

    try {
      setLoading(true)
      const shares = ethers.parseEther(withdrawShares)
      const trancheIndex = trancheTemplates.findIndex(t => t.type === selectedTranche.type)
      
      const tx = await vaultContract.withdraw(trancheIndex, shares)
      await tx.wait()
      
      await loadVaultData()
      setWithdrawShares('')
      alert('Withdrawal successful!')
    } catch (error) {
      console.error('Withdrawal failed:', error)
      alert('Withdrawal failed. Please check lockup period.')
    } finally {
      setLoading(false)
    }
  }

  if (!account) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="text-center">
          <div className="text-6xl mb-4">🏦</div>
          <h2 className="text-3xl font-bold text-white mb-4">Symbiotic Tranche Vaults</h2>
          <p className="text-white/70 mb-8">Connect your wallet to access tranche-based carbon credit staking</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">
          🏛️ Symbiotic Tranche Vaults
        </h1>
        <p className="text-white/70 text-lg max-w-3xl mx-auto">
          Choose your risk profile with our MBS-inspired tranche system. Senior tranches offer stability, 
          while Junior tranches provide maximum yield potential.
        </p>
      </div>

      {/* User Position Summary */}
      {userPosition && (
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 border border-white/10">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            💼 Your Position Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-400">{parseFloat(userPosition.seniorShares).toFixed(2)}</div>
              <div className="text-white/60 text-sm">Senior Shares</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{parseFloat(userPosition.mezzanineShares).toFixed(2)}</div>
              <div className="text-white/60 text-sm">Mezzanine Shares</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">{parseFloat(userPosition.juniorShares).toFixed(2)}</div>
              <div className="text-white/60 text-sm">Junior Shares</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{parseFloat(userPosition.totalValue).toFixed(4)} ETH</div>
              <div className="text-white/60 text-sm">Total Value</div>
            </div>
          </div>
        </div>
      )}

      {/* Tranche Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {trancheData.map((tranche, index) => (
          <div
            key={tranche.type}
            className={`group relative overflow-hidden rounded-2xl p-6 border transition-all duration-300 hover:-translate-y-2 cursor-pointer ${
              selectedTranche?.type === tranche.type
                ? `border-${tranche.color}-500 bg-${tranche.color}-500/10`
                : 'border-white/10 bg-slate-900/50 hover:border-white/20'
            }`}
            onClick={() => setSelectedTranche(tranche)}
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl">{tranche.icon}</div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  tranche.riskLevel === 'Low' ? 'bg-emerald-500/20 text-emerald-400' :
                  tranche.riskLevel === 'Medium' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-orange-500/20 text-orange-400'
                }`}>
                  {tranche.riskLevel} Risk
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-2">{tranche.name}</h3>
              <p className="text-white/70 text-sm mb-4">{tranche.description}</p>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-white/60">APY</span>
                  <span className={`font-bold text-${tranche.color}-400`}>
                    {tranche.currentAPY.toFixed(1)}%
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-white/60">Total Deposited</span>
                  <span className="text-white">{parseFloat(tranche.totalDeposited).toFixed(2)} ETH</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-white/60">Target Allocation</span>
                  <span className="text-white">{tranche.targetAllocation}%</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-white/60">Lockup Period</span>
                  <span className="text-white">{Math.round(tranche.lockupPeriod)} days</span>
                </div>
              </div>

              <div className={`mt-4 px-4 py-2 rounded-lg text-center text-sm font-medium ${
                tranche.acceptingDeposits 
                  ? 'bg-emerald-500/20 text-emerald-400' 
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {tranche.acceptingDeposits ? '✅ Accepting Deposits' : '❌ Deposits Paused'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Panel */}
      {selectedTranche && (
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <div className="flex items-center gap-3 mb-6">
            <div className="text-2xl">{selectedTranche.icon}</div>
            <h3 className="text-2xl font-bold text-white">{selectedTranche.name}</h3>
          </div>

          {/* Tab Navigation */}
          <div className="flex mb-6 bg-slate-800 rounded-xl p-1">
            <button
              onClick={() => setActiveTab('deposit')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'deposit'
                  ? 'bg-emerald-500 text-white'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              💰 Deposit
            </button>
            <button
              onClick={() => setActiveTab('withdraw')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'withdraw'
                  ? 'bg-orange-500 text-white'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              📤 Withdraw
            </button>
          </div>

          {/* Deposit Tab */}
          {activeTab === 'deposit' && (
            <div className="space-y-4">
              <div>
                <label className="block text-white font-medium mb-2">
                  Deposit Amount (ETH)
                </label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="0.0"
                  className="w-full px-4 py-3 bg-slate-800 border border-white/20 rounded-xl text-white placeholder-white/50 focus:border-emerald-500 focus:outline-none"
                />
              </div>
              
              <button
                onClick={handleDeposit}
                disabled={loading || !depositAmount || !selectedTranche.acceptingDeposits}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : `Deposit into ${selectedTranche.name}`}
              </button>
            </div>
          )}

          {/* Withdraw Tab */}
          {activeTab === 'withdraw' && (
            <div className="space-y-4">
              <div>
                <label className="block text-white font-medium mb-2">
                  Shares to Withdraw
                </label>
                <input
                  type="number"
                  value={withdrawShares}
                  onChange={(e) => setWithdrawShares(e.target.value)}
                  placeholder="0.0"
                  className="w-full px-4 py-3 bg-slate-800 border border-white/20 rounded-xl text-white placeholder-white/50 focus:border-orange-500 focus:outline-none"
                />
                {userPosition && (
                  <div className="mt-2 text-sm text-white/60">
                    Available shares: {
                      selectedTranche.type === 'SENIOR' ? userPosition.seniorShares :
                      selectedTranche.type === 'MEZZANINE' ? userPosition.mezzanineShares :
                      userPosition.juniorShares
                    }
                  </div>
                )}
              </div>
              
              <button
                onClick={handleWithdraw}
                disabled={loading || !withdrawShares}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : `Withdraw from ${selectedTranche.name}`}
              </button>

              <div className="text-sm text-white/60 bg-slate-800/50 p-3 rounded-lg">
                ⚠️ Note: Withdrawals are subject to the {Math.round(selectedTranche.lockupPeriod)}-day lockup period.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}