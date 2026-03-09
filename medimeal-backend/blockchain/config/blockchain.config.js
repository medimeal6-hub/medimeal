require('dotenv').config();

module.exports = {
  // Network configuration
  network: process.env.BLOCKCHAIN_NETWORK || 'mumbai', // 'mumbai' for testnet, 'polygon' for mainnet
  
  // RPC URLs
  rpcUrl: process.env.BLOCKCHAIN_RPC_URL || 'https://rpc-mumbai.maticvigil.com',
  
  // Wallet configuration
  privateKey: process.env.BLOCKCHAIN_PRIVATE_KEY || '',
  
  // Contract addresses (deploy and update these)
  contracts: {
    healthRecordRegistry: process.env.HEALTH_RECORD_CONTRACT || '',
    prescriptionRegistry: process.env.PRESCRIPTION_CONTRACT || '',
    consentManager: process.env.CONSENT_CONTRACT || ''
  },
  
  // IPFS configuration
  ipfs: {
    host: process.env.IPFS_HOST || 'ipfs.infura.io',
    port: process.env.IPFS_PORT || 5001,
    protocol: process.env.IPFS_PROTOCOL || 'https',
    gateway: process.env.IPFS_GATEWAY || 'https://ipfs.io',
    headers: {
      authorization: process.env.IPFS_AUTH || ''
    }
  },
  
  // Gas configuration
  gas: {
    limit: process.env.GAS_LIMIT || 500000,
    price: process.env.GAS_PRICE || 'auto'
  },
  
  // Feature flags
  features: {
    enableBlockchain: process.env.ENABLE_BLOCKCHAIN === 'true',
    enableIPFS: process.env.ENABLE_IPFS === 'true',
    autoRegisterRecords: process.env.AUTO_REGISTER_RECORDS === 'true'
  }
};
