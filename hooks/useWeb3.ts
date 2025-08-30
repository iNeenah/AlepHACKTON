import { useContext } from 'react'
import { Web3Provider } from '@/components/Web3Provider'

// This file re-exports the useWeb3 hook from Web3Provider
// This pattern allows for easier imports and potential future customization

export { useWeb3 } from '@/components/Web3Provider'