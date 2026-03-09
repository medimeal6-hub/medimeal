const { ethers } = require('ethers');
const crypto = require('crypto');
const config = require('../config/blockchain.config');

class BlockchainService {
  constructor() {
    this.provider = null;
    this.wallet = null;
    this.contracts = {};
    this.initialized = false;
  }

  /**
   * Initialize blockchain connection
   */
  async initialize() {
    try {
      // Connect to Polygon Mumbai testnet or mainnet
      this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
      
      // Create wallet from private key
      this.wallet = new ethers.Wallet(config.privateKey, this.provider);
      
      // Load contract instances
      await this.loadContracts();
      
      this.initialized = true;
      console.log('✅ Blockchain service initialized');
      console.log(`📍 Network: ${config.network}`);
      console.log(`💼 Wallet: ${this.wallet.address}`);
      
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize blockchain service:', error.message);
      return false;
    }
  }

  /**
   * Load smart contract instances
   */
  async loadContracts() {
    const HealthRecordRegistry = require('../contracts/HealthRecordRegistry.json');
    const PrescriptionRegistry = require('../contracts/PrescriptionRegistry.json');
    const ConsentManager = require('../contracts/ConsentManager.json');

    this.contracts.healthRecords = new ethers.Contract(
      config.contracts.healthRecordRegistry,
      HealthRecordRegistry.abi,
      this.wallet
    );

    this.contracts.prescriptions = new ethers.Contract(
      config.contracts.prescriptionRegistry,
      PrescriptionRegistry.abi,
      this.wallet
    );

    this.contracts.consent = new ethers.Contract(
      config.contracts.consentManager,
      ConsentManager.abi,
      this.wallet
    );
  }

  /**
   * Generate hash for data
   */
  generateHash(data) {
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    return '0x' + crypto.createHash('sha256').update(dataString).digest('hex');
  }

  /**
   * Register health record on blockchain
   */
  async registerHealthRecord(recordData) {
    try {
      if (!this.initialized) {
        throw new Error('Blockchain service not initialized');
      }

      const recordHash = this.generateHash(recordData);
      const ipfsHash = recordData.ipfsHash || '';
      const patient = recordData.patientAddress;
      const recordType = recordData.type;

      const tx = await this.contracts.healthRecords.registerRecord(
        recordHash,
        ipfsHash,
        patient,
        recordType
      );

      const receipt = await tx.wait();
      
      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        recordHash: recordHash,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      console.error('Error registering health record:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Verify health record on blockchain
   */
  async verifyHealthRecord(recordHash) {
    try {
      if (!this.initialized) {
        throw new Error('Blockchain service not initialized');
      }

      const result = await this.contracts.healthRecords.verifyRecord(recordHash);
      
      return {
        exists: result.exists,
        isActive: result.isActive,
        timestamp: result.timestamp.toString()
      };
    } catch (error) {
      console.error('Error verifying health record:', error);
      return {
        exists: false,
        error: error.message
      };
    }
  }

  /**
   * Issue prescription on blockchain
   */
  async issuePrescription(prescriptionData) {
    try {
      if (!this.initialized) {
        throw new Error('Blockchain service not initialized');
      }

      const prescriptionHash = this.generateHash(prescriptionData);
      const patient = prescriptionData.patientAddress;
      const ipfsHash = prescriptionData.ipfsHash || '';
      const validityDays = prescriptionData.validityDays || 30;

      const tx = await this.contracts.prescriptions.issuePrescription(
        prescriptionHash,
        patient,
        ipfsHash,
        validityDays
      );

      const receipt = await tx.wait();
      
      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        prescriptionHash: prescriptionHash,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      console.error('Error issuing prescription:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Verify prescription on blockchain
   */
  async verifyPrescription(prescriptionHash) {
    try {
      if (!this.initialized) {
        throw new Error('Blockchain service not initialized');
      }

      const result = await this.contracts.prescriptions.verifyPrescription(prescriptionHash);
      
      return {
        exists: result.exists,
        isValid: result.isValid,
        isExpired: result.isExpired,
        isFilled: result.isFilled,
        doctor: result.doctor,
        patient: result.patient
      };
    } catch (error) {
      console.error('Error verifying prescription:', error);
      return {
        exists: false,
        error: error.message
      };
    }
  }

  /**
   * Grant consent on blockchain
   */
  async grantConsent(consentData) {
    try {
      if (!this.initialized) {
        throw new Error('Blockchain service not initialized');
      }

      const provider = consentData.providerAddress;
      const dataTypes = consentData.dataTypes || ['health-records', 'prescriptions'];
      const durationDays = consentData.durationDays || 90;
      const purpose = consentData.purpose || 'Medical treatment';

      const tx = await this.contracts.consent.grantConsent(
        provider,
        dataTypes,
        durationDays,
        purpose
      );

      const receipt = await tx.wait();
      
      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      console.error('Error granting consent:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Check consent on blockchain
   */
  async checkConsent(patientAddress, providerAddress) {
    try {
      if (!this.initialized) {
        throw new Error('Blockchain service not initialized');
      }

      const result = await this.contracts.consent.checkConsent(
        patientAddress,
        providerAddress
      );
      
      return {
        hasConsent: result.hasConsent,
        dataTypes: result.dataTypes,
        expiryTime: result.expiryTime.toString()
      };
    } catch (error) {
      console.error('Error checking consent:', error);
      return {
        hasConsent: false,
        error: error.message
      };
    }
  }

  /**
   * Get gas price estimate
   */
  async getGasPrice() {
    try {
      const feeData = await this.provider.getFeeData();
      return {
        gasPrice: ethers.formatUnits(feeData.gasPrice, 'gwei'),
        maxFeePerGas: ethers.formatUnits(feeData.maxFeePerGas, 'gwei'),
        maxPriorityFeePerGas: ethers.formatUnits(feeData.maxPriorityFeePerGas, 'gwei')
      };
    } catch (error) {
      console.error('Error getting gas price:', error);
      return null;
    }
  }

  /**
   * Get wallet balance
   */
  async getBalance() {
    try {
      const balance = await this.provider.getBalance(this.wallet.address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Error getting balance:', error);
      return '0';
    }
  }

  /**
   * Get transaction receipt
   */
  async getTransactionReceipt(txHash) {
    try {
      return await this.provider.getTransactionReceipt(txHash);
    } catch (error) {
      console.error('Error getting transaction receipt:', error);
      return null;
    }
  }
}

// Singleton instance
const blockchainService = new BlockchainService();

module.exports = blockchainService;
