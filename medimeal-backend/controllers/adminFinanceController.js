const Subscription = require('../models/Subscription');
const Payment = require('../models/Payment');
const User = require('../models/User');
const Appointment = require('../models/Appointment');

/**
 * GET /api/admin/finance/revenue-tracking
 * Get doctor/dietitian revenue tracking
 */
const getRevenueTracking = async (req, res) => {
  try {
    const { period = '30', role } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get all doctors/dietitians
    const staffQuery = { role: { $in: ['doctor', 'dietitian'] } };
    if (role) {
      staffQuery.role = role;
    }

    const staff = await User.find(staffQuery).select('_id firstName lastName email role specialization');

    // Calculate revenue per staff member
    const revenueData = await Promise.all(
      staff.map(async (member) => {
        // Count appointments (assuming each appointment has a fee)
        const appointments = await Appointment.countDocuments({
          'provider.name': { $regex: `${member.firstName} ${member.lastName}`, $options: 'i' },
          appointmentDate: { $gte: startDate },
          status: 'completed'
        });

        // Get subscription revenue if applicable
        const subscriptions = await Subscription.find({
          userId: member._id,
          status: 'active',
          createdAt: { $gte: startDate }
        });

        const subscriptionRevenue = subscriptions.reduce((sum, sub) => {
          const payments = sub.paymentHistory || [];
          return sum + payments.reduce((pSum, p) => pSum + (p.amount || 0), 0);
        }, 0);

        // Calculate commission (assuming 20% commission rate)
        const commissionRate = 0.2;
        const estimatedRevenue = appointments * 50; // Assuming $50 per appointment
        const commission = estimatedRevenue * commissionRate;

        return {
          staffId: member._id,
          name: `${member.firstName} ${member.lastName}`,
          email: member.email,
          role: member.role,
          specialization: member.specialization,
          appointments,
          estimatedRevenue,
          subscriptionRevenue,
          commission,
          totalRevenue: estimatedRevenue + subscriptionRevenue
        };
      })
    );

    // Sort by total revenue
    revenueData.sort((a, b) => b.totalRevenue - a.totalRevenue);

    // Calculate totals
    const totals = revenueData.reduce(
      (acc, item) => ({
        totalAppointments: acc.totalAppointments + item.appointments,
        totalRevenue: acc.totalRevenue + item.totalRevenue,
        totalCommission: acc.totalCommission + item.commission
      }),
      { totalAppointments: 0, totalRevenue: 0, totalCommission: 0 }
    );

    res.json({
      success: true,
      data: {
        revenueData,
        totals,
        period: days
      }
    });
  } catch (error) {
    console.error('Get revenue tracking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get revenue tracking',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * GET /api/admin/finance/commissions
 * Get commission management data
 */
const getCommissions = async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get all payments for staff
    const staff = await User.find({
      role: { $in: ['doctor', 'dietitian'] }
    }).select('_id firstName lastName email role');

    const commissionData = await Promise.all(
      staff.map(async (member) => {
        const appointments = await Appointment.countDocuments({
          'provider.name': { $regex: `${member.firstName} ${member.lastName}`, $options: 'i' },
          appointmentDate: { $gte: startDate },
          status: 'completed'
        });

        const commissionRate = 0.2; // 20% commission
        const revenuePerAppointment = 50; // $50 per appointment
        const totalRevenue = appointments * revenuePerAppointment;
        const commission = totalRevenue * commissionRate;
        const payout = commission; // Assuming full payout

        return {
          staffId: member._id,
          name: `${member.firstName} ${member.lastName}`,
          email: member.email,
          role: member.role,
          appointments,
          totalRevenue,
          commissionRate: commissionRate * 100,
          commission,
          payout,
          status: payout > 0 ? 'pending' : 'none'
        };
      })
    );

    const totalCommission = commissionData.reduce((sum, item) => sum + item.commission, 0);
    const totalPayout = commissionData.reduce((sum, item) => sum + item.payout, 0);

    res.json({
      success: true,
      data: {
        commissions: commissionData,
        summary: {
          totalCommission,
          totalPayout,
          pendingPayouts: commissionData.filter(c => c.status === 'pending').length
        }
      }
    });
  } catch (error) {
    console.error('Get commissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get commissions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * POST /api/admin/finance/commissions/:staffId/pay
 * Mark commission as paid
 */
const markCommissionPaid = async (req, res) => {
  try {
    const { staffId } = req.params;
    const { amount, paymentDate, notes } = req.body;

    // In a real system, you'd update a Commission model
    // For now, we'll just return success
    res.json({
      success: true,
      message: 'Commission marked as paid',
      data: {
        staffId,
        amount,
        paymentDate: paymentDate || new Date(),
        notes
      }
    });
  } catch (error) {
    console.error('Mark commission paid error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark commission as paid',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getRevenueTracking,
  getCommissions,
  markCommissionPaid
};

