'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { ethers } from 'ethers'

interface Web3ContextType {
  provider: ethers.BrowserProvider | null
  account: string | null
  contract: ethers.Contract | null
  connectWallet: () => Promise<void>
  disconnect: () => void
}

const Web3Context = createContext<Web3ContextType>({
  provider: null,
  account: null,
  contract: null,
  connectWallet: async () => {},
  disconnect: () => {},
})

// Contract ABI (simplified for key functions)
const CONTRACT_ABI = [
  "function mintCarbonCredit(address to, uint256 carbonAmount, string memory projectName, string memory location, uint256 expiryDate, string memory tokenURI) external",
  "function listForSale(uint256 tokenId, uint256 price) external",
  "function buyCarbonCredit(uint256 tokenId) external payable",
  "function retireCarbonCredit(uint256 tokenId) external",
  "function getTokensByOwner(address owner) external view returns (uint256[] memory)",
  "function getTokensForSale() external view returns (uint256[] memory)",
  "function getCarbonCredit(uint256 tokenId) external view returns (tuple(uint256 tokenId, uint256 carbonAmount, string projectName, string location, uint256 issuanceDate, uint256 expiryDate, address verifier, bool isRetired, uint256 price, bool isForSale))",
  "function removeFromSale(uint256 tokenId) external",
  "function tokenURI(uint256 tokenId) external view returns (string memory)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function addVerifier(address verifier) external",
  "event CarbonCreditMinted(uint256 indexed tokenId, address indexed to, uint256 carbonAmount, string projectName)",
  "event CarbonCreditSold(uint256 indexed tokenId, address indexed from, address indexed to, uint256 price)"
]

// Contract address will be set after deployment
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3" // localhost default

export function Web3Provider({ children }: { children: ReactNode }) {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [account, setAccount] = useState<string | null>(null)
  const [contract, setContract] = useState<ethers.Contract | null>(null)

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' })
        
        const provider = new ethers.BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()
        const address = await signer.getAddress()
        
        // Create contract instance
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)
        
        setProvider(provider)
        setAccount(address)
        setContract(contract)
        
        console.log('Connected to wallet:', address)
      } catch (error) {
        console.error('Failed to connect wallet:', error)
      }
    } else {
      alert('Please install MetaMask or another Web3 wallet')
    }
  }

  const disconnect = () => {
    setProvider(null)
    setAccount(null)
    setContract(null)
  }

  useEffect(() => {
    // Check if already connected
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            connectWallet()
          }
        })
    }

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect()
        } else {
          connectWallet()
        }
      })

      window.ethereum.on('chainChanged', () => {
        window.location.reload()
      })
    }
  }, [])

  return (
    <Web3Context.Provider value={{ provider, account, contract, connectWallet, disconnect }}>
      {children}
    </Web3Context.Provider>
  )
}

export const useWeb3 = () => useContext(Web3Context)