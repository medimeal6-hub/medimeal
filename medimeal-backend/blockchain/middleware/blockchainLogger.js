const blockchainService = require('../services/blockchainService');

/**
 * Middleware to log critical operations to blockchain
 */
const blockchainLogger = (options = {}) => {
  return async (req, res, next) => {
    const { recordType, enabled = true } = options;

    if (!enabled || !blockchainService.initialized) {
      return next();
    }

    // Store original json method
    const originalJson = res.json.bind(res);

    // Override json method to capture response
    res.json = async function(data) {
      // Only log successful operations
      if (data.success && recordType) {
        try {
          let blockchainData = null;

          switch (recordType) {
            case 'health-record':
              if (data.data && data.data.healthRecord) {
                blockchainData = await blockchainService.registerHealthRecord({
                  ...data.data.healthRecord,
                  patientAddress: req.user?.blockchainAddress || req.user?._id
                });
              }
              break;

            case 'prescription':
              if (data.data && data.data.prescription) {
                blockchainData = await blockchainService.issuePrescription({
                  ...data.data.prescription,
                  patientAddress: req.user?.blockchainAddress || req.user?._id
                });
              }
              break;

            default:
              break;
          }

          // Attach blockchain data to response
          if (blockchainData && blockchainData.success) {
            data.blockchain = {
              transactionHash: blockchainData.transactionHash,
              blockNumber: blockchainData.blockNumber,
              verified: true
            };
          }
        } catch (error) {
          console.error('Blockchain logging error:', error);
          // Don't fail the request if blockchain logging fails
        }
      }

      return originalJson(data);
    };

    next();
  };
};

module.exports = blockchainLogger;
