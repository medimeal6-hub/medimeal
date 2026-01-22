import { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, CreditCard, TrendingUp, Users, FileText, CheckCircle } from 'lucide-react';

const SubscriptionFinance = () => {
  const [revenueData, setRevenueData] = useState(null);
  const [commissions, setCommissions] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [revenueRes, commissionsRes, subscriptionsRes, paymentsRes] = await Promise.all([
        axios.get('/api/admin/finance/revenue-tracking'),
        axios.get('/api/admin/finance/commissions'),
        axios.get('/api/admin/subscriptions'),
        axios.get('/api/admin/payments')
      ]);

      setRevenueData(revenueRes.data.data);
      setCommissions(commissionsRes.data.data);
      setSubscriptions(subscriptionsRes.data.data || []);
      setPayments(paymentsRes.data.data || []);
    } catch (error) {
      console.error('Error fetching finance data:', error);
      // Use mock data
      setRevenueData({
        revenueData: [
          {
            staffId: '1',
            name: 'Dr. John Smith',
            email: 'john.smith@example.com',
            role: 'doctor',
            specialization: 'Cardiology',
            appointments: 45,
            estimatedRevenue: 2250,
            subscriptionRevenue: 0,
            commission: 450,
            totalRevenue: 2250
          },
          {
            staffId: '2',
            name: 'Dr. Jane Doe',
            email: 'jane.doe@example.com',
            role: 'doctor',
            specialization: 'Endocrinology',
            appointments: 38,
            estimatedRevenue: 1900,
            subscriptionRevenue: 0,
            commission: 380,
            totalRevenue: 1900
          }
        ],
        totals: {
          totalAppointments: 83,
          totalRevenue: 4150,
          totalCommission: 830
        }
      });
      setCommissions({
        commissions: [
          {
            staffId: '1',
            name: 'Dr. John Smith',
            email: 'john.smith@example.com',
            role: 'doctor',
            appointments: 45,
            totalRevenue: 2250,
            commissionRate: 20,
            commission: 450,
            payout: 450,
            status: 'pending'
          }
        ],
        summary: {
          totalCommission: 830,
          totalPayout: 830,
          pendingPayouts: 2
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPaid = async (staffId) => {
    try {
      await axios.post(`/api/admin/finance/commissions/${staffId}/pay`, {
        amount: commissions.commissions.find(c => c.staffId === staffId)?.commission,
        paymentDate: new Date(),
        notes: 'Commission paid'
      });
      alert('Commission marked as paid');
      fetchData();
    } catch (error) {
      console.error('Error marking commission as paid:', error);
      alert('Failed to mark commission as paid');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Subscription & Finance</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'overview' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('revenue')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'revenue' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Revenue Tracking
          </button>
          <button
            onClick={() => setActiveTab('commissions')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'commissions' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Commissions
          </button>
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'subscriptions' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Subscriptions
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'payments' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Payments
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-2">
              <DollarSign className="w-5 h-5 text-green-600 mr-2" />
              <div className="text-sm text-gray-600">Total Revenue</div>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              ${revenueData?.totals?.totalRevenue?.toLocaleString() || '0'}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-2">
              <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
              <div className="text-sm text-gray-600">Total Commission</div>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              ${commissions?.summary?.totalCommission?.toLocaleString() || '0'}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-2">
              <Users className="w-5 h-5 text-purple-600 mr-2" />
              <div className="text-sm text-gray-600">Active Subscriptions</div>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {subscriptions.filter(s => s.status === 'active').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-2">
              <CreditCard className="w-5 h-5 text-orange-600 mr-2" />
              <div className="text-sm text-gray-600">Pending Payouts</div>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {commissions?.summary?.pendingPayouts || 0}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'revenue' && revenueData && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Tracking by Staff</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Staff Member</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Role</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Appointments</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Revenue</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Commission</th>
                </tr>
              </thead>
              <tbody>
                {revenueData.revenueData.map((staff) => (
                  <tr key={staff.staffId} className="border-b border-gray-100">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{staff.name}</div>
                      <div className="text-sm text-gray-500">{staff.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {staff.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">{staff.appointments}</td>
                    <td className="py-3 px-4 text-right font-medium">
                      ${staff.totalRevenue.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-green-600">
                      ${staff.commission.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 font-semibold">
                  <td colSpan="2" className="py-3 px-4">Total</td>
                  <td className="py-3 px-4 text-right">{revenueData.totals.totalAppointments}</td>
                  <td className="py-3 px-4 text-right">${revenueData.totals.totalRevenue.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right">${revenueData.totals.totalCommission.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'commissions' && commissions && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Commission Management</h3>
          <div className="mb-4 grid grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-gray-600">Total Commission</div>
              <div className="text-xl font-bold text-blue-700">
                ${commissions.summary.totalCommission.toLocaleString()}
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm text-gray-600">Total Payout</div>
              <div className="text-xl font-bold text-green-700">
                ${commissions.summary.totalPayout.toLocaleString()}
              </div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="text-sm text-gray-600">Pending Payouts</div>
              <div className="text-xl font-bold text-yellow-700">
                {commissions.summary.pendingPayouts}
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Staff Member</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Appointments</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Revenue</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Commission Rate</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Commission</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {commissions.commissions.map((commission) => (
                  <tr key={commission.staffId} className="border-b border-gray-100">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{commission.name}</div>
                      <div className="text-sm text-gray-500">{commission.email}</div>
                    </td>
                    <td className="py-3 px-4 text-right">{commission.appointments}</td>
                    <td className="py-3 px-4 text-right">${commission.totalRevenue.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">{commission.commissionRate}%</td>
                    <td className="py-3 px-4 text-right font-medium text-green-600">
                      ${commission.commission.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 rounded text-xs ${
                        commission.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {commission.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {commission.status === 'pending' && (
                        <button
                          onClick={() => handleMarkPaid(commission.staffId)}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                        >
                          Mark Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'subscriptions' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Subscriptions</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">User</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Plan</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Start Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">End Date</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.slice(0, 10).map((sub) => (
                  <tr key={sub._id} className="border-b border-gray-100">
                    <td className="py-3 px-4">{sub.userId?.email || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {sub.plan}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        sub.status === 'active' ? 'bg-green-100 text-green-800' :
                        sub.status === 'expired' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {new Date(sub.startDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      {sub.endDate ? new Date(sub.endDate).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">User</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Amount</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Transaction ID</th>
                </tr>
              </thead>
              <tbody>
                {payments.slice(0, 10).map((payment) => (
                  <tr key={payment._id} className="border-b border-gray-100">
                    <td className="py-3 px-4">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">{payment.userId?.email || 'N/A'}</td>
                    <td className="py-3 px-4 text-right font-medium">
                      ${payment.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        payment.status === 'success' ? 'bg-green-100 text-green-800' :
                        payment.status === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {payment.transactionId || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionFinance;

