// Global type declarations for Web3 and Ethereum

interface Window {
  ethereum?: {
    request: (args: { method: string; params?: any[] }) => Promise<any>
    on: (event: string, callback: (...args: any[]) => void) => void
    removeListener: (event: string, callback: (...args: any[]) => void) => void
    isMetaMask?: boolean
    isConnected?: () => boolean
    selectedAddress?: string
  }
}

// Ethereum provider types
declare global {
  interface EthereumProvider {
    request: (args: { method: string; params?: any[] }) => Promise<any>
    on: (event: string, callback: (...args: any[]) => void) => void
    removeListener: (event: string, callback: (...args: any[]) => void) => void
    isMetaMask?: boolean
    isConnected?: () => boolean
    selectedAddress?: string
  }
}

export {}