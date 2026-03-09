const express = require('express');
const router = express.Router();
const blockchainService = require('../services/blockchainService');
const ipfsService = require('../services/ipfsService');
const appointmentBlockchainService = require('../services/appointmentBlockchainService');
const { protect } = require('../../middleware/auth');

/**
 * @route   GET /api/blockchain/status
 * @desc    Get blockchain service status
 * @access  Public
 */
router.get('/status', async (req, res) => {
  try {
    const balance = await blockchainService.getBalance();
    const gasPrice = await blockchainService.getGasPrice();

    res.json({
      success: true,
      data: {
        initialized: blockchainService.initialized,
        network: require('../config/blockchain.config').network,
        walletAddress: blockchainService.wallet?.address,
        balance: balance,
        gasPrice: gasPrice
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get blockchain status',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/blockchain/health-record/register
 * @desc    Register health record on blockchain
 * @access  Private (Doctor)
 */
router.post('/health-record/register', protect, async (req, res) => {
  try {
    const { recordData, patientId } = req.body;

    // Upload to IPFS if enabled
    let ipfsHash = '';
    if (ipfsService.initialized) {
      const ipfsResult = await ipfsService.uploadData(recordData);
      if (ipfsResult.success) {
        ipfsHash = ipfsResult.hash;
      }
    }

    // Register on blockchain
    const result = await blockchainService.registerHealthRecord({
      ...recordData,
      ipfsHash,
      patientAddress: patientId
    });

    if (result.success) {
      res.json({
        success: true,
        message: 'Health record registered on blockchain',
        data: {
          transactionHash: result.transactionHash,
          blockNumber: result.blockNumber,
          recordHash: result.recordHash,
          ipfsHash: ipfsHash,
          ipfsUrl: ipfsHash ? ipfsService.getGatewayUrl(ipfsHash) : null
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to register health record',
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error registering health record',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/blockchain/health-record/verify
 * @desc    Verify health record on blockchain
 * @access  Private
 */
router.post('/health-record/verify', protect, async (req, res) => {
  try {
    const { recordHash } = req.body;

    const result = await blockchainService.verifyHealthRecord(recordHash);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying health record',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/blockchain/prescription/issue
 * @desc    Issue prescription on blockchain
 * @access  Private (Doctor)
 */
router.post('/prescription/issue', protect, async (req, res) => {
  try {
    const { prescriptionData, patientId, validityDays } = req.body;

    // Upload to IPFS if enabled
    let ipfsHash = '';
    if (ipfsService.initialized) {
      const ipfsResult = await ipfsService.uploadData(prescriptionData);
      if (ipfsResult.success) {
        ipfsHash = ipfsResult.hash;
      }
    }

    // Issue on blockchain
    const result = await blockchainService.issuePrescription({
      ...prescriptionData,
      ipfsHash,
      patientAddress: patientId,
      validityDays: validityDays || 30
    });

    if (result.success) {
      res.json({
        success: true,
        message: 'Prescription issued on blockchain',
        data: {
          transactionHash: result.transactionHash,
          blockNumber: result.blockNumber,
          prescriptionHash: result.prescriptionHash,
          ipfsHash: ipfsHash,
          ipfsUrl: ipfsHash ? ipfsService.getGatewayUrl(ipfsHash) : null
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to issue prescription',
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error issuing prescription',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/blockchain/prescription/verify
 * @desc    Verify prescription on blockchain
 * @access  Public
 */
router.post('/prescription/verify', async (req, res) => {
  try {
    const { prescriptionHash } = req.body;

    const result = await blockchainService.verifyPrescription(prescriptionHash);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying prescription',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/blockchain/consent/grant
 * @desc    Grant consent on blockchain
 * @access  Private (Patient)
 */
router.post('/consent/grant', protect, async (req, res) => {
  try {
    const { providerAddress, dataTypes, durationDays, purpose } = req.body;

    const result = await blockchainService.grantConsent({
      providerAddress,
      dataTypes,
      durationDays,
      purpose
    });

    if (result.success) {
      res.json({
        success: true,
        message: 'Consent granted on blockchain',
        data: {
          transactionHash: result.transactionHash,
          blockNumber: result.blockNumber
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to grant consent',
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error granting consent',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/blockchain/consent/check/:patientAddress/:providerAddress
 * @desc    Check consent on blockchain
 * @access  Private
 */
router.get('/consent/check/:patientAddress/:providerAddress', protect, async (req, res) => {
  try {
    const { patientAddress, providerAddress } = req.params;

    const result = await blockchainService.checkConsent(patientAddress, providerAddress);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking consent',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/blockchain/ipfs/upload
 * @desc    Upload data to IPFS
 * @access  Private
 */
router.post('/ipfs/upload', protect, async (req, res) => {
  try {
    const { data } = req.body;

    const result = await ipfsService.uploadData(data);

    if (result.success) {
      res.json({
        success: true,
        message: 'Data uploaded to IPFS',
        data: {
          hash: result.hash,
          url: result.url,
          size: result.size
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to upload to IPFS',
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error uploading to IPFS',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/blockchain/ipfs/:hash
 * @desc    Retrieve data from IPFS
 * @access  Private
 */
router.get('/ipfs/:hash', protect, async (req, res) => {
  try {
    const { hash } = req.params;

    const result = await ipfsService.getData(hash);

    if (result.success) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve from IPFS',
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving from IPFS',
      error: error.message
    });
  }
});

module.exports = router;


// ==================== APPOINTMENT BLOCKCHAIN ROUTES ====================

/**
 * @route   POST /api/blockchain/appointment/register
 * @desc    Register appointment on blockchain
 * @access  Private
 */
router.post('/appointment/register', protect, async (req, res) => {
  try {
    const { appointmentId, appointment } = req.body;

    if (!appointment) {
      return res.status(400).json({
        success: false,
        message: 'Appointment data is required'
      });
    }

    const result = await appointmentBlockchainService.registerAppointment(appointment);

    res.json({
      success: true,
      message: 'Appointment registered on blockchain',
      data: result
    });
  } catch (error) {
    console.error('Error registering appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering appointment on blockchain',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/blockchain/appointment/update-status
 * @desc    Update appointment status on blockchain
 * @access  Private
 */
router.post('/appointment/update-status', protect, async (req, res) => {
  try {
    const { appointmentId, status, reason } = req.body;

    if (!appointmentId || !status) {
      return res.status(400).json({
        success: false,
        message: 'Appointment ID and status are required'
      });
    }

    const result = await appointmentBlockchainService.updateAppointmentStatus(
      appointmentId,
      status,
      reason
    );

    res.json({
      success: true,
      message: 'Appointment status updated on blockchain',
      data: result
    });
  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating appointment status',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/blockchain/appointment/complete
 * @desc    Complete appointment on blockchain
 * @access  Private (Doctor)
 */
router.post('/appointment/complete', protect, async (req, res) => {
  try {
    const { appointmentId, notes } = req.body;

    if (!appointmentId) {
      return res.status(400).json({
        success: false,
        message: 'Appointment ID is required'
      });
    }

    const result = await appointmentBlockchainService.completeAppointment(
      appointmentId,
      notes
    );

    res.json({
      success: true,
      message: 'Appointment completed on blockchain',
      data: result
    });
  } catch (error) {
    console.error('Error completing appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Error completing appointment',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/blockchain/appointment/cancel
 * @desc    Cancel appointment on blockchain
 * @access  Private
 */
router.post('/appointment/cancel', protect, async (req, res) => {
  try {
    const { appointmentId, reason } = req.body;

    if (!appointmentId) {
      return res.status(400).json({
        success: false,
        message: 'Appointment ID is required'
      });
    }

    const result = await appointmentBlockchainService.cancelAppointment(
      appointmentId,
      reason
    );

    res.json({
      success: true,
      message: 'Appointment cancelled on blockchain',
      data: result
    });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling appointment',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/blockchain/appointment/reschedule
 * @desc    Reschedule appointment on blockchain
 * @access  Private
 */
router.post('/appointment/reschedule', protect, async (req, res) => {
  try {
    const { appointmentId, newDate, reason } = req.body;

    if (!appointmentId || !newDate) {
      return res.status(400).json({
        success: false,
        message: 'Appointment ID and new date are required'
      });
    }

    const result = await appointmentBlockchainService.rescheduleAppointment(
      appointmentId,
      newDate,
      reason
    );

    res.json({
      success: true,
      message: 'Appointment rescheduled on blockchain',
      data: result
    });
  } catch (error) {
    console.error('Error rescheduling appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Error rescheduling appointment',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/blockchain/appointment/mark-no-show
 * @desc    Mark appointment as no-show on blockchain
 * @access  Private (Doctor)
 */
router.post('/appointment/mark-no-show', protect, async (req, res) => {
  try {
    const { appointmentId } = req.body;

    if (!appointmentId) {
      return res.status(400).json({
        success: false,
        message: 'Appointment ID is required'
      });
    }

    const result = await appointmentBlockchainService.markNoShow(appointmentId);

    res.json({
      success: true,
      message: 'Appointment marked as no-show on blockchain',
      data: result
    });
  } catch (error) {
    console.error('Error marking no-show:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking appointment as no-show',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/blockchain/appointment/verify
 * @desc    Verify appointment on blockchain
 * @access  Public
 */
router.post('/appointment/verify', async (req, res) => {
  try {
    const { appointmentHash } = req.body;

    if (!appointmentHash) {
      return res.status(400).json({
        success: false,
        message: 'Appointment hash is required'
      });
    }

    const result = await appointmentBlockchainService.verifyAppointment(appointmentHash);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error verifying appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying appointment',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/blockchain/appointment/history/:appointmentId
 * @desc    Get appointment status history from blockchain
 * @access  Private
 */
router.get('/appointment/history/:appointmentId', protect, async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const history = await appointmentBlockchainService.getAppointmentHistory(appointmentId);

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Error getting appointment history:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting appointment history',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/blockchain/appointment/reschedule-history/:appointmentId
 * @desc    Get appointment reschedule history from blockchain
 * @access  Private
 */
router.get('/appointment/reschedule-history/:appointmentId', protect, async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const history = await appointmentBlockchainService.getRescheduleHistory(appointmentId);

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Error getting reschedule history:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting reschedule history',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/blockchain/appointment/attendance/:appointmentId
 * @desc    Check if patient attended appointment
 * @access  Private
 */
router.get('/appointment/attendance/:appointmentId', protect, async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const attended = await appointmentBlockchainService.didPatientAttend(appointmentId);

    res.json({
      success: true,
      data: {
        appointmentId,
        attended
      }
    });
  } catch (error) {
    console.error('Error checking attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking attendance',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/blockchain/appointment/attendance-rate/:patientAddress
 * @desc    Get patient attendance rate
 * @access  Private
 */
router.get('/appointment/attendance-rate/:patientAddress', protect, async (req, res) => {
  try {
    const { patientAddress } = req.params;

    const result = await appointmentBlockchainService.getPatientAttendanceRate(patientAddress);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error getting attendance rate:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting attendance rate',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/blockchain/appointment/details/:appointmentId
 * @desc    Get appointment details from blockchain
 * @access  Private
 */
router.get('/appointment/details/:appointmentId', protect, async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const details = await appointmentBlockchainService.getAppointmentDetails(appointmentId);

    res.json({
      success: true,
      data: details
    });
  } catch (error) {
    console.error('Error getting appointment details:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting appointment details',
      error: error.message
    });
  }
});
