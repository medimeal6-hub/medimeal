import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import axios from 'axios'
import { 
  DollarSign,
  CreditCard,
  Receipt,
  Download,
  Filter,
  Search,
  Calendar,
  User,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  TrendingDown
} from 'lucide-react'

const Billing = () => {
  const { user } = useAuth()
  const [billingData, setBillingData] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedPeriod, setSelectedPeriod] = useState('month')

  useEffect(() => {
    fetchBillingData()
  }, [selectedPeriod])

  const fetchBillingData = async () => {
    try {
      const response = await axios.get(`/api/doctor/billing?period=${selectedPeriod}`)
      setBillingData(response.data.data)
    } catch (error) {
      console.error('Error fetching billing data:', error)
      // Mock data
      setBillingData({
        summary: {
          totalRevenue: 12500,
          totalPatients: 45,
          averagePerPatient: 278,
          monthlyGrowth: 12.5,
          pendingPayments: 3200,
          completedPayments: 9300
        },
        transactions: [
          {
            id: 1,
            patientName: 'Adam Messy',
            patientId: '123456',
            service: 'Consultation',
            amount: 150,
            status: 'paid',
            date: '2023-06-08',
            paymentMethod: 'Credit Card',
            invoiceNumber: 'INV-001'
          },
          {
            id: 2,
            patientName: 'Celine Aluista',
            patientId: '985746',
            service: 'Follow-up Consultation',
            amount: 100,
            status: 'paid',
            date: '2023-06-07',
            paymentMethod: 'Cash',
            invoiceNumber: 'INV-002'
          },
          {
            id: 3,
            patientName: 'Malachi Ardo',
            patientId: '047638',
            service: 'Emergency Consultation',
            amount: 300,
            status: 'pending',
            date: '2023-06-08',
            paymentMethod: 'Insurance',
            invoiceNumber: 'INV-003'
          },
          {
            id: 4,
            patientName: 'Mathias Olivera',
            patientId: '248957',
            service: 'Surgery Consultation',
            amount: 500,
            status: 'paid',
            date: '2023-06-06',
            paymentMethod: 'Bank Transfer',
            invoiceNumber: 'INV-004'
          },
          {
            id: 5,
            patientName: 'Sarah Johnson',
            patientId: '789123',
            service: 'Regular Checkup',
            amount: 200,
            status: 'overdue',
            date: '2023-06-05',
            paymentMethod: 'Credit Card',
            invoiceNumber: 'INV-005'
          }
        ]
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'overdue':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4" />
      case 'pending':
        return <Clock className="w-4 h-4" />
      case 'overdue':
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const filteredTransactions = billingData?.transactions?.filter(transaction => {
    const matchesSearch = transaction.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.service.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || transaction.status === filterStatus
    return matchesSearch && matchesFilter
  }) || []

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing & Payments</h1>
          <p className="text-gray-600 mt-1">Manage your billing, payments, and financial reports</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex items-center text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span className="text-sm font-medium">+{billingData?.summary?.monthlyGrowth || 12.5}%</span>
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">${billingData?.summary?.totalRevenue?.toLocaleString() || '12,500'}</div>
            <div className="text-sm text-gray-600">Total Revenue</div>
          </div>
        </div>

        {/* Total Patients */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{billingData?.summary?.totalPatients || 45}</div>
            <div className="text-sm text-gray-600">Total Patients</div>
          </div>
        </div>

        {/* Average Per Patient */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <Receipt className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">${billingData?.summary?.averagePerPatient || 278}</div>
            <div className="text-sm text-gray-600">Avg. Per Patient</div>
          </div>
        </div>

        {/* Pending Payments */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">${billingData?.summary?.pendingPayments?.toLocaleString() || '3,200'}</div>
            <div className="text-sm text-gray-600">Pending Payments</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search transactions by patient name, invoice number, or service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                        <User className="w-4 h-4 text-gray-500" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{transaction.patientName}</div>
                        <div className="text-sm text-gray-500">#{transaction.patientId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{transaction.service}</div>
                    <div className="text-sm text-gray-500">{transaction.invoiceNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">${transaction.amount}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                      {getStatusIcon(transaction.status)}
                      <span className="ml-1">{transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(transaction.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.paymentMethod}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Receipt className="w-4 h-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Payment Methods */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CreditCard className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-sm text-gray-600">Credit Card</span>
              </div>
              <span className="text-sm font-medium text-gray-900">45%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <DollarSign className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-sm text-gray-600">Cash</span>
              </div>
              <span className="text-sm font-medium text-gray-900">25%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Receipt className="w-5 h-5 text-purple-600 mr-2" />
                <span className="text-sm text-gray-600">Insurance</span>
              </div>
              <span className="text-sm font-medium text-gray-900">20%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <TrendingUp className="w-5 h-5 text-orange-600 mr-2" />
                <span className="text-sm text-gray-600">Bank Transfer</span>
              </div>
              <span className="text-sm font-medium text-gray-900">10%</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Payment received from Adam Messy</span>
              <span className="text-xs text-gray-400">2 min ago</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Payment pending from Malachi Ardo</span>
              <span className="text-xs text-gray-400">15 min ago</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Overdue payment from Sarah Johnson</span>
              <span className="text-xs text-gray-400">1 hour ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Billing
