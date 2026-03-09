const { create } = require('ipfs-http-client');
const config = require('../config/blockchain.config');

class IPFSService {
  constructor() {
    this.client = null;
    this.initialized = false;
  }

  /**
   * Initialize IPFS client
   */
  async initialize() {
    try {
      // Using Infura IPFS or local node
      this.client = create({
        host: config.ipfs.host,
        port: config.ipfs.port,
        protocol: config.ipfs.protocol,
        headers: config.ipfs.headers
      });

      this.initialized = true;
      console.log('✅ IPFS service initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize IPFS service:', error.message);
      return false;
    }
  }

  /**
   * Upload data to IPFS
   */
  async uploadData(data) {
    try {
      if (!this.initialized) {
        throw new Error('IPFS service not initialized');
      }

      const dataString = typeof data === 'string' ? data : JSON.stringify(data);
      const result = await this.client.add(dataString);
      
      return {
        success: true,
        hash: result.path,
        size: result.size,
        url: `${config.ipfs.gateway}/ipfs/${result.path}`
      };
    } catch (error) {
      console.error('Error uploading to IPFS:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Upload file to IPFS
   */
  async uploadFile(fileBuffer, filename) {
    try {
      if (!this.initialized) {
        throw new Error('IPFS service not initialized');
      }

      const result = await this.client.add({
        path: filename,
        content: fileBuffer
      });
      
      return {
        success: true,
        hash: result.path,
        size: result.size,
        url: `${config.ipfs.gateway}/ipfs/${result.path}`
      };
    } catch (error) {
      console.error('Error uploading file to IPFS:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Retrieve data from IPFS
   */
  async getData(hash) {
    try {
      if (!this.initialized) {
        throw new Error('IPFS service not initialized');
      }

      const chunks = [];
      for await (const chunk of this.client.cat(hash)) {
        chunks.push(chunk);
      }
      
      const data = Buffer.concat(chunks).toString('utf8');
      
      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Error retrieving from IPFS:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Pin data to ensure persistence
   */
  async pinData(hash) {
    try {
      if (!this.initialized) {
        throw new Error('IPFS service not initialized');
      }

      await this.client.pin.add(hash);
      
      return {
        success: true,
        hash: hash
      };
    } catch (error) {
      console.error('Error pinning to IPFS:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Unpin data
   */
  async unpinData(hash) {
    try {
      if (!this.initialized) {
        throw new Error('IPFS service not initialized');
      }

      await this.client.pin.rm(hash);
      
      return {
        success: true,
        hash: hash
      };
    } catch (error) {
      console.error('Error unpinning from IPFS:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get IPFS gateway URL
   */
  getGatewayUrl(hash) {
    return `${config.ipfs.gateway}/ipfs/${hash}`;
  }
}

// Singleton instance
const ipfsService = new IPFSService();

module.exports = ipfsService;
