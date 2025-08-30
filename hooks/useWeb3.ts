'use client'

import React, { useState, useEffect, createContext, useContext } from 'react'
import { ethers } from 'ethers'

// Contract ABI and address
const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
const CONTRACT_ABI = [
  // Add your contract ABI here
  "function mintCarbonCredit(address to, uint256 carbonAmount, string memory projectName, string memory location, uint256 expiryDate, string memory metadataURI) external",
  "function buyCarbonCredit(uint256 tokenId) external payable",
  "function retireCarbonCredit(uint256 tokenId) external",
  "function listForSale(uint256 tokenId, uint256 price) external",
  "function removeFromSale(uint256 tokenId) external",
  "function getTokensByOwner(address owner) external view returns (uint256[] memory)",
  "function getTokensForSale() external view returns (uint256[] memory)",
  "function getCarbonCredit(uint256 tokenId) external view returns (tuple(uint256 tokenId, uint256 carbonAmount, string projectName, string location, uint256 issuanceDate, uint256 expiryDate, address verifier, bool isRetired, uint256 price, bool isForSale))",
  "function tokenURI(uint256 tokenId) external view returns (string memory)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function balanceOf(address owner) external view returns (uint256)"
]

interface Web3State {
  provider: ethers.BrowserProvider | null
  signer: ethers.JsonRpcSigner | null
  account: string | null
  contract: ethers.Contract | null
  chainId: number | null
  isConnecting: boolean
  error: string | null
}

interface Web3ContextType extends Web3State {
  connectWallet: () => Promise<void>
  disconnect: () => void
  switchNetwork: (chainId: number) => Promise<void>
}

const Web3Context = createContext<Web3ContextType | null>(null)

export const useWeb3 = () => {
  const context = useContext(Web3Context)
  if (!context) {
    // Return a default implementation for when used outside provider
    const [state, setState] = useState<Web3State>({
      provider: null,
      signer: null,
      account: null,
      contract: null,
      chainId: null,
      isConnecting: false,
      error: null
    })

    const connectWallet = async () => {
      if (typeof window === 'undefined' || !window.ethereum) {
        setState(prev => ({ ...prev, error: 'MetaMask not found' }))
        return
      }

      try {
        setState(prev => ({ ...prev, isConnecting: true, error: null }))
        
        const provider = new ethers.BrowserProvider(window.ethereum)
        await provider.send('eth_requestAccounts', [])
        
        const signer = await provider.getSigner()
        const account = await signer.getAddress()
        const network = await provider.getNetwork()
        const chainId = Number(network.chainId)
        
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)
        
        setState({
          provider,
          signer,
          account,
          contract,
          chainId,
          isConnecting: false,
          error: null
        })
      } catch (error: any) {
        setState(prev => ({
          ...prev,
          isConnecting: false,
          error: error.message || 'Failed to connect wallet'
        }))
      }
    }

    const disconnect = () => {
      setState({
        provider: null,
        signer: null,
        account: null,
        contract: null,
        chainId: null,
        isConnecting: false,
        error: null
      })
    }

    const switchNetwork = async (targetChainId: number) => {
      if (!window.ethereum) return
      
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${targetChainId.toString(16)}` }],
        })
      } catch (error: any) {
        if (error.code === 4902) {
          // Network not added to MetaMask
          console.error('Network not found in wallet')
        }
        throw error
      }
    }

    // Listen for account changes
    useEffect(() => {
      if (typeof window !== 'undefined' && window.ethereum) {
        const handleAccountsChanged = (accounts: string[]) => {
          if (accounts.length === 0) {
            disconnect()
          } else if (accounts[0] !== state.account) {
            connectWallet()
          }
        }

        const handleChainChanged = () => {
          window.location.reload()
        }

        window.ethereum.on('accountsChanged', handleAccountsChanged)
        window.ethereum.on('chainChanged', handleChainChanged)

        return () => {
          if (window.ethereum) {
            window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
            window.ethereum.removeListener('chainChanged', handleChainChanged)
          }
        }
      }
    }, [state.account])

    return {
      ...state,
      connectWallet,
      disconnect,
      switchNetwork
    }
  }
  return context
}

// Provider component would go here if needed
export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  const web3State = useWeb3()
  
  return React.createElement(
    Web3Context.Provider,
    { value: web3State },
    children
  )
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any
  }
}