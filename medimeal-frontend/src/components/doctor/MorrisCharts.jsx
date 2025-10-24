import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import axios from 'axios'
import { 
  BarChart3,
  PieChart,
  LineChart,
  TrendingUp,
  Download,
  RefreshCw,
  Filter,
  Calendar,
  Activity,
  Users,
  DollarSign
} from 'lucide-react'

const MorrisCharts = () => {
  const { user } = useAuth()
  const [chartData, setChartData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedChart, setSelectedChart] = useState('patient-stats')

  useEffect(() => {
    fetchChartData()
  }, [selectedChart])

  const fetchChartData = async () => {
    try {
      const response = await axios.get(`/api/doctor/charts/morris?type=${selectedChart}`)
      setChartData(response.data.data)
    } catch (error) {
      console.error('Error fetching chart data:', error)
      // Mock data
      setChartData({
        patientStats: [
          { month: 'Jan', patients: 12 },
          { month: 'Feb', patients: 19 },
          { month: 'Mar', patients: 15 },
          { month: 'Apr', patients: 25 },
          { month: 'May', patients: 22 },
          { month: 'Jun', patients: 30 }
        ],
        appointmentDistribution: [
          { label: 'Consultation', value: 45 },
          { label: 'Follow-up', value: 25 },
          { label: 'Emergency', value: 15 },
          { label: 'Surgery', value: 15 }
        ],
        revenueTrends: [
          { week: 'Week 1', revenue: 2500 },
          { week: 'Week 2', revenue: 3200 },
          { week: 'Week 3', revenue: 2800 },
          { week: 'Week 4', revenue: 4000 }
        ]
      })
    } finally {
      setLoading(false)
    }
  }

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
          <h1 className="text-2xl font-bold text-gray-900">Morris Charts</h1>
          <p className="text-gray-600 mt-1">Advanced data visualization with Morris.js charts</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedChart}
            onChange={(e) => setSelectedChart(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="patient-stats">Patient Statistics</option>
            <option value="appointment-distribution">Appointment Distribution</option>
            <option value="revenue-trends">Revenue Trends</option>
          </select>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Export Chart
          </button>
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            {selectedChart === 'patient-stats' && 'Patient Statistics Over Time'}
            {selectedChart === 'appointment-distribution' && 'Appointment Type Distribution'}
            {selectedChart === 'revenue-trends' && 'Revenue Trends'}
          </h3>
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <Filter className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <Calendar className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chart Placeholder */}
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <div className="flex items-center justify-center mb-4">
            {selectedChart === 'patient-stats' && <BarChart3 className="w-16 h-16 text-blue-600" />}
            {selectedChart === 'appointment-distribution' && <PieChart className="w-16 h-16 text-green-600" />}
            {selectedChart === 'revenue-trends' && <LineChart className="w-16 h-16 text-purple-600" />}
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            {selectedChart === 'patient-stats' && 'Patient Statistics Chart'}
            {selectedChart === 'appointment-distribution' && 'Appointment Distribution Chart'}
            {selectedChart === 'revenue-trends' && 'Revenue Trends Chart'}
          </h4>
          <p className="text-gray-600 mb-4">
            {selectedChart === 'patient-stats' && 'Track patient numbers and trends over time'}
            {selectedChart === 'appointment-distribution' && 'Visualize distribution of appointment types'}
            {selectedChart === 'revenue-trends' && 'Monitor revenue patterns and growth'}
          </p>
          
          {/* Data Preview */}
          <div className="bg-white rounded-lg p-4 shadow-sm max-w-md mx-auto">
            <div className="text-sm text-gray-500 mb-2">Data Preview:</div>
            {selectedChart === 'patient-stats' && (
              <div className="space-y-1">
                {chartData?.patientStats?.slice(0, 3).map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{item.month}:</span>
                    <span className="font-medium">{item.patients} patients</span>
                  </div>
                ))}
                <div className="text-xs text-gray-400 mt-2">... and more data</div>
              </div>
            )}
            {selectedChart === 'appointment-distribution' && (
              <div className="space-y-1">
                {chartData?.appointmentDistribution?.slice(0, 3).map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{item.label}:</span>
                    <span className="font-medium">{item.value}%</span>
                  </div>
                ))}
                <div className="text-xs text-gray-400 mt-2">... and more data</div>
              </div>
            )}
            {selectedChart === 'revenue-trends' && (
              <div className="space-y-1">
                {chartData?.revenueTrends?.slice(0, 3).map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{item.week}:</span>
                    <span className="font-medium">${item.revenue}</span>
                  </div>
                ))}
                <div className="text-xs text-gray-400 mt-2">... and more data</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chart Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <BarChart3 className="w-8 h-8 text-blue-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Bar Charts</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">Compare categorical data</p>
          <div className="bg-gray-50 rounded-lg p-4 h-24 flex items-center justify-center">
            <BarChart3 className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <PieChart className="w-8 h-8 text-green-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Donut Charts</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">Show proportional data</p>
          <div className="bg-gray-50 rounded-lg p-4 h-24 flex items-center justify-center">
            <PieChart className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <LineChart className="w-8 h-8 text-purple-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Line Charts</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">Track trends over time</p>
          <div className="bg-gray-50 rounded-lg p-4 h-24 flex items-center justify-center">
            <LineChart className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <Activity className="w-8 h-8 text-orange-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Area Charts</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">Show cumulative data</p>
          <div className="bg-gray-50 rounded-lg p-4 h-24 flex items-center justify-center">
            <Activity className="w-8 h-8 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Chart Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Chart Performance</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Load Time</span>
              <span className="text-sm font-medium text-green-600">0.3s</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Data Points</span>
              <span className="text-sm font-medium text-blue-600">156</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Updates</span>
              <span className="text-sm font-medium text-purple-600">24/hour</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Sources</h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <Users className="w-4 h-4 text-blue-600 mr-2" />
              <span className="text-sm text-gray-600">Patient Database</span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 text-green-600 mr-2" />
              <span className="text-sm text-gray-600">Appointment System</span>
            </div>
            <div className="flex items-center">
              <DollarSign className="w-4 h-4 text-purple-600 mr-2" />
              <span className="text-sm text-gray-600">Billing System</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
              Export Chart Data
            </button>
            <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
              Schedule Auto-Update
            </button>
            <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
              Share Chart
            </button>
            <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
              Customize Chart
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MorrisCharts
