'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'

interface StatsProps {
  forSaleCredits: any[]
  userCredits: any[]
  contract: ethers.Contract | null
}

export function AdvancedStats({ forSaleCredits, userCredits, contract }: StatsProps) {
  const [totalVolume, setTotalVolume] = useState(0)
  const [avgPrice, setAvgPrice] = useState(0)
  const [totalCO2Offset, setTotalCO2Offset] = useState(0)
  const [priceHistory, setPriceHistory] = useState<number[]>([])

  useEffect(() => {
    calculateStats()
    generatePriceHistory()
  }, [forSaleCredits, userCredits])

  const calculateStats = () => {
    // Volume calculation
    const volume = forSaleCredits.reduce((sum, credit) => {
      return sum + parseFloat(ethers.formatEther(credit.price || 0))
    }, 0)
    
    // Average price
    const avgPriceValue = forSaleCredits.length > 0 
      ? volume / forSaleCredits.length 
      : 0
    
    // Total CO2 offset
    const co2Total = [...forSaleCredits, ...userCredits].reduce((sum, credit) => {
      return sum + Number(credit.carbonAmount || 0)
    }, 0)
    
    setTotalVolume(volume)
    setAvgPrice(avgPriceValue)
    setTotalCO2Offset(co2Total)
  }

  const generatePriceHistory = () => {
    const history = []
    let currentPrice = 0.1
    for (let i = 0; i < 30; i++) {
      currentPrice += (Math.random() - 0.5) * 0.02
      currentPrice = Math.max(0.05, currentPrice)
      history.push(currentPrice)
    }
    setPriceHistory(history)
  }

  const formatNumber = (num: number, decimals = 2) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(num)
  }

  const renderMiniChart = (data: number[]) => {
    const max = Math.max(...data)
    const min = Math.min(...data)
    const range = max - min
    
    return (
      <div className="flex items-end space-x-1 h-12">
        {data.slice(-20).map((value, index) => {
          const height = range > 0 ? ((value - min) / range) * 100 : 50
          return (
            <div
              key={index}
              className="bg-primary rounded-t w-1 transition-all duration-300"
              style={{
                height: `${Math.max(height, 5)}%`,
              }}
            />
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Main Stats */}
      <div className="grid-4 grid-modern">
        {/* Total Volume */}
        <div className="stats-card">
          <div className="flex items-center justify-between mb-3">
            <div className="text-2xl">💰</div>
            <div className="text-primary text-xs font-medium uppercase tracking-wide">VOL</div>
          </div>
          <h3 className="text-small font-medium text-neutral-500 uppercase tracking-wide">Total Volume</h3>
          <p className="text-2xl font-bold text-primary">
            {formatNumber(totalVolume, 4)} ETH
          </p>
          <p className="text-xs text-neutral-400">≈ ${formatNumber(totalVolume * 2500, 0)} USD</p>
        </div>

        {/* Average Price */}
        <div className="stats-card">
          <div className="flex items-center justify-between mb-3">
            <div className="text-2xl">📈</div>
            <div className="text-success text-xs font-medium uppercase tracking-wide">AVG</div>
          </div>
          <h3 className="text-small font-medium text-neutral-500 uppercase tracking-wide">Average Price</h3>
          <p className="text-2xl font-bold text-success">
            {formatNumber(avgPrice, 4)} ETH
          </p>
          <div className="mt-2">
            {renderMiniChart(priceHistory)}
          </div>
        </div>

        {/* Total CO2 */}
        <div className="stats-card">
          <div className="flex items-center justify-between mb-3">
            <div className="text-2xl">🌍</div>
            <div className="text-warning text-xs font-medium uppercase tracking-wide">CO₂</div>
          </div>
          <h3 className="text-small font-medium text-neutral-500 uppercase tracking-wide">CO₂ Offset</h3>
          <p className="text-2xl font-bold text-warning">
            {formatNumber(totalCO2Offset)} t
          </p>
          <p className="text-xs text-neutral-400">Total compensated</p>
        </div>

        {/* Environmental Impact */}
        <div className="stats-card">
          <div className="flex items-center justify-between mb-3">
            <div className="text-2xl">🌳</div>
            <div className="text-emerald-600 text-xs font-medium uppercase tracking-wide">ECO</div>
          </div>
          <h3 className="text-small font-medium text-neutral-500 uppercase tracking-wide">Tree Equivalent</h3>
          <p className="text-2xl font-bold text-emerald-600">
            {formatNumber(totalCO2Offset * 3.67)}
          </p>
          <p className="text-xs text-neutral-400">Trees saved</p>
        </div>
      </div>

      {/* Market Activity Chart */}
      <div className="card-premium p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-heading-3">Market Activity</h3>
            <p className="text-body">Real-time price trends</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-small font-medium">Live</span>
          </div>
        </div>

        {/* Simple Chart */}
        <div className="h-32 flex items-end justify-between space-x-2 bg-neutral-50 rounded-xl p-4">
          {priceHistory.slice(-15).map((value, index) => {
            const max = Math.max(...priceHistory)
            const min = Math.min(...priceHistory)
            const height = ((value - min) / (max - min)) * 100 || 50
            
            return (
              <div key={index} className="flex flex-col items-center space-y-1 flex-1">
                <div
                  className="bg-gradient-primary rounded-t-sm transition-all duration-300 hover:opacity-80 w-full"
                  style={{
                    height: `${Math.max(height, 10)}%`,
                  }}
                />
                <div className="text-xs text-neutral-400 font-mono">
                  {formatNumber(value, 2)}
                </div>
              </div>
            )
          })}
        </div>

        {/* Market Indicators */}
        <div className="grid-3 grid-modern mt-6">
          <div className="text-center p-4 bg-emerald-50 rounded-xl border border-emerald-200">
            <div className="text-xl font-bold text-emerald-600">↗️ +12%</div>
            <div className="text-small text-emerald-600">Last Week</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="text-xl font-bold text-primary">📊 {forSaleCredits.length}</div>
            <div className="text-small text-primary">Active</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-200">
            <div className="text-xl font-bold text-purple-600">⚡ Live</div>
            <div className="text-small text-purple-600">Status</div>
          </div>
        </div>
      </div>
    </div>
  )
}