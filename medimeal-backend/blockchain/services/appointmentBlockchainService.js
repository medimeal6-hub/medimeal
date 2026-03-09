const { ethers } = require('ethers');
const crypto = require('crypto');
const blockchainConfig = require('../config/blockchain.config');
const ipfsService = require('./ipfsService');

class AppointmentBlockchainService {
  constructor() {
    this.provider = null;
    this.wallet = null;
    this.contract = null;
    this.initialized = false;
  }

  /**
   * Initialize the appointment blockchain service
   */
  async initialize() {
    try {
      if (this.initialized) {
        return true;
      }

      // Check if blockchain is enabled
      if (!blockchainConfig.enabled) {
        console.log('⚠️  Appointment blockchain service disabled');
        return false;
      }

      // Initialize provider
      this.provider = new ethers.JsonRpcProvider(blockchainConfig.rpcUrl);

      // Initialize wallet
      this.wallet = new ethers.Wallet(blockchainConfig.privateKey, this.provider);

      // Initialize contract
      const contractAddress = process.env.APPOINTMENT_CONTRACT;
      if (!contractAddress) {
        throw new Error('APPOINTMENT_CONTRACT address not configured');
      }

      // Load contract ABI
      const AppointmentRegistry = require('../artifacts/contracts/AppointmentRegistry.sol/AppointmentRegistry.json');
      this.contract = new ethers.Contract(
        contractAddress,
        AppointmentRegistry.abi,
        this.wallet
      );

      this.initialized = true;
      console.log('✅ Appointment blockchain service initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize appointment blockchain service:', error.message);
      return false;
    }
  }

  /**
   * Generate appointment hash
   */
  generateAppointmentHash(appointment) {
    const data = {
      userId: appointment.userId.toString(),
      doctorId: appointment.doctorId.toString(),
      appointmentDate: appointment.appointmentDate.toISOString(),
      type: appointment.type,
      reasonForVisit: appointment.reasonForVisit,
      provider: appointment.provider.name
    };

    const dataString = JSON.stringify(data);
    return '0x' + crypto.createHash('sha256').update(dataString).digest('hex');
  }

  /**
   * Convert address to blockchain address (simplified)
   */
  addressToBlockchainAddress(address) {
    // In production, you'd map user IDs to their wallet addresses
    // For now, generate deterministic address from ID
    const hash = crypto.createHash('sha256').update(address.toString()).digest('hex');
    return '0x' + hash.substring(0, 40);
  }

  /**
   * Register appointment on blockchain
   */
  async registerAppointment(appointment) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      if (!this.initialized) {
        throw new Error('Blockchain service not initialized');
      }

      // Generate appointment hash
      const appointmentHash = this.generateAppointmentHash(appointment);

      // Convert addresses
      const patientAddress = this.addressToBlockchainAddress(appointment.userId);
      const doctorAddress = this.addressToBlockchainAddress(appointment.doctorId);

      // Convert appointment date to timestamp
      const appointmentTimestamp = Math.floor(new Date(appointment.appointmentDate).getTime() / 1000);

      // Register on blockchain
      const tx = await this.contract.registerAppointment(
        appointmentHash,
        patientAddress,
        doctorAddress,
        appointmentTimestamp,
        appointment.type || 'consultation'
      );

      // Wait for confirmation
      const receipt = await tx.wait();

      // Extract appointment ID from event
      const event = receipt.logs.find(log => {
        try {
          const parsed = this.contract.interface.parseLog(log);
          return parsed.name === 'AppointmentRegistered';
        } catch {
          return false;
        }
      });

      let appointmentId = null;
      if (event) {
        const parsed = this.contract.interface.parseLog(event);
        appointmentId = parsed.args.appointmentId.toString();
      }

      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        appointmentHash,
        appointmentId,
        chainId: blockchainConfig.chainId,
        timestamp: new Date(),
        verified: true
      };
    } catch (error) {
      console.error('Error registering appointment on blockchain:', error);
      throw error;
    }
  }

  /**
   * Update appointment status on blockchain
   */
  async updateAppointmentStatus(appointmentId, newStatus, reason = '') {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      // Map status string to enum value
      const statusMap = {
        'scheduled': 0,
        'confirmed': 1,
        'completed': 2,
        'cancelled': 3,
        'no-show': 4,
        'rescheduled': 5
      };

      const statusValue = statusMap[newStatus.toLowerCase()];
      if (statusValue === undefined) {
        throw new Error(`Invalid status: ${newStatus}`);
      }

      const tx = await this.contract.updateAppointmentStatus(
        appointmentId,
        statusValue,
        reason
      );

      const receipt = await tx.wait();

      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        status: newStatus,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error updating appointment status:', error);
      throw error;
    }
  }

  /**
   * Complete appointment on blockchain
   */
  async completeAppointment(appointmentId, notes = {}) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      // Upload notes to IPFS if available
      let ipfsHash = '';
      if (notes && Object.keys(notes).length > 0) {
        const ipfsResult = await ipfsService.uploadJSON(notes);
        ipfsHash = ipfsResult.hash;
      }

      const tx = await this.contract.completeAppointment(
        appointmentId,
        ipfsHash
      );

      const receipt = await tx.wait();

      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        ipfsHash,
        ipfsUrl: ipfsHash ? `${process.env.IPFS_GATEWAY}/ipfs/${ipfsHash}` : '',
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error completing appointment:', error);
      throw error;
    }
  }

  /**
   * Cancel appointment on blockchain
   */
  async cancelAppointment(appointmentId, reason) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const tx = await this.contract.cancelAppointment(
        appointmentId,
        reason || 'Cancelled by user'
      );

      const receipt = await tx.wait();

      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        reason,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      throw error;
    }
  }

  /**
   * Reschedule appointment on blockchain
   */
  async rescheduleAppointment(appointmentId, newDate, reason) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const newTimestamp = Math.floor(new Date(newDate).getTime() / 1000);

      const tx = await this.contract.rescheduleAppointment(
        appointmentId,
        newTimestamp,
        reason || 'Rescheduled by user'
      );

      const receipt = await tx.wait();

      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        newDate,
        reason,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      throw error;
    }
  }

  /**
   * Mark appointment as no-show
   */
  async markNoShow(appointmentId) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const tx = await this.contract.markNoShow(appointmentId);
      const receipt = await tx.wait();

      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error marking no-show:', error);
      throw error;
    }
  }

  /**
   * Verify appointment on blockchain
   */
  async verifyAppointment(appointmentHash) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const result = await this.contract.verifyAppointment(appointmentHash);

      const statusMap = ['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'RESCHEDULED'];

      return {
        exists: result.exists,
        status: statusMap[result.status],
        appointmentDate: new Date(Number(result.appointmentDate) * 1000),
        createdAt: new Date(Number(result.createdAt) * 1000),
        isActive: result.isActive
      };
    } catch (error) {
      console.error('Error verifying appointment:', error);
      throw error;
    }
  }

  /**
   * Get appointment history from blockchain
   */
  async getAppointmentHistory(appointmentId) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const history = await this.contract.getAppointmentHistory(appointmentId);

      const statusMap = ['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'RESCHEDULED'];

      return history.map(change => ({
        fromStatus: statusMap[change.fromStatus],
        toStatus: statusMap[change.toStatus],
        timestamp: new Date(Number(change.timestamp) * 1000),
        changedBy: change.changedBy,
        reason: change.reason
      }));
    } catch (error) {
      console.error('Error getting appointment history:', error);
      throw error;
    }
  }

  /**
   * Get reschedule history
   */
  async getRescheduleHistory(appointmentId) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const history = await this.contract.getRescheduleHistory(appointmentId);

      return history.map(reschedule => ({
        originalDate: new Date(Number(reschedule.originalDate) * 1000),
        newDate: new Date(Number(reschedule.newDate) * 1000),
        timestamp: new Date(Number(reschedule.timestamp) * 1000),
        reason: reschedule.reason,
        rescheduledBy: reschedule.rescheduledBy
      }));
    } catch (error) {
      console.error('Error getting reschedule history:', error);
      throw error;
    }
  }

  /**
   * Check if patient attended appointment
   */
  async didPatientAttend(appointmentId) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const attended = await this.contract.didPatientAttend(appointmentId);
      return attended;
    } catch (error) {
      console.error('Error checking attendance:', error);
      throw error;
    }
  }

  /**
   * Get patient attendance rate
   */
  async getPatientAttendanceRate(patientAddress) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const result = await this.contract.getPatientAttendanceRate(patientAddress);

      const total = Number(result.totalAppointments);
      const attended = Number(result.attended);
      const noShows = Number(result.noShows);

      return {
        totalAppointments: total,
        attended,
        noShows,
        attendanceRate: total > 0 ? ((attended / total) * 100).toFixed(2) : 0
      };
    } catch (error) {
      console.error('Error getting attendance rate:', error);
      throw error;
    }
  }

  /**
   * Get appointment details from blockchain
   */
  async getAppointmentDetails(appointmentId) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const result = await this.contract.getAppointment(appointmentId);

      const statusMap = ['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'RESCHEDULED'];

      return {
        appointmentHash: result.appointmentHash,
        patient: result.patient,
        doctor: result.doctor,
        appointmentDate: new Date(Number(result.appointmentDate) * 1000),
        appointmentType: result.appointmentType,
        status: statusMap[result.status],
        createdAt: new Date(Number(result.createdAt) * 1000),
        ipfsHash: result.ipfsHash,
        ipfsUrl: result.ipfsHash ? `${process.env.IPFS_GATEWAY}/ipfs/${result.ipfsHash}` : '',
        isActive: result.isActive
      };
    } catch (error) {
      console.error('Error getting appointment details:', error);
      throw error;
    }
  }
}

module.exports = new AppointmentBlockchainService();
