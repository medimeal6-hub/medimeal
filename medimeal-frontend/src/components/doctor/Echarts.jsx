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
  Calendar
} from 'lucide-react'

const Echarts = () => {
  const { user } = useAuth()
  const [chartData, setChartData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedChart, setSelectedChart] = useState('patient-flow')

  useEffect(() => {
    fetchChartData()
  }, [selectedChart])

  const fetchChartData = async () => {
    try {
      const response = await axios.get(`/api/doctor/charts/echarts?type=${selectedChart}`)
      setChartData(response.data.data)
    } catch (error) {
      console.error('Error fetching chart data:', error)
      // Mock data
      setChartData({
        patientFlow: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [
            {
              label: 'New Patients',
              data: [12, 19, 15, 25, 22, 30],
              backgroundColor: 'rgba(59, 130, 246, 0.5)',
              borderColor: 'rgba(59, 130, 246, 1)',
              borderWidth: 2
            },
            {
              label: 'Follow-ups',
              data: [8, 15, 12, 18, 16, 24],
              backgroundColor: 'rgba(16, 185, 129, 0.5)',
              borderColor: 'rgba(16, 185, 129, 1)',
              borderWidth: 2
            }
          ]
        },
        appointmentTypes: {
          labels: ['Consultation', 'Follow-up', 'Emergency', 'Surgery'],
          datasets: [{
            data: [45, 25, 15, 15],
            backgroundColor: [
              'rgba(59, 130, 246, 0.8)',
              'rgba(16, 185, 129, 0.8)',
              'rgba(239, 68, 68, 0.8)',
              'rgba(139, 92, 246, 0.8)'
            ]
          }]
        },
        revenue: {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
          datasets: [{
            label: 'Revenue ($)',
            data: [2500, 3200, 2800, 4000],
            backgroundColor: 'rgba(34, 197, 94, 0.5)',
            borderColor: 'rgba(34, 197, 94, 1)',
            borderWidth: 2,
            fill: true
          }]
        }
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
          <h1 className="text-2xl font-bold text-gray-900">Echarts Visualization</h1>
          <p className="text-gray-600 mt-1">Interactive charts and data visualization using Echarts</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedChart}
            onChange={(e) => setSelectedChart(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="patient-flow">Patient Flow</option>
            <option value="appointment-types">Appointment Types</option>
            <option value="revenue">Revenue Trends</option>
          </select>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Export Chart
          </button>
        </div>
      </div>

      {/* Chart Controls */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Chart Controls</h3>
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
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            {selectedChart === 'patient-flow' && 'Patient Flow Chart'}
            {selectedChart === 'appointment-types' && 'Appointment Types Distribution'}
            {selectedChart === 'revenue' && 'Revenue Trends'}
          </h4>
          <p className="text-gray-600 mb-4">
            {selectedChart === 'patient-flow' && 'Track new patients and follow-ups over time'}
            {selectedChart === 'appointment-types' && 'Distribution of different appointment types'}
            {selectedChart === 'revenue' && 'Monthly revenue trends and projections'}
          </p>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-500 mb-2">Sample Data:</div>
            {selectedChart === 'patient-flow' && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>New Patients (Jun):</span>
                  <span className="font-medium">30</span>
                </div>
                <div className="flex justify-between">
                  <span>Follow-ups (Jun):</span>
                  <span className="font-medium">24</span>
                </div>
              </div>
            )}
            {selectedChart === 'appointment-types' && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Consultation:</span>
                  <span className="font-medium">45%</span>
                </div>
                <div className="flex justify-between">
                  <span>Follow-up:</span>
                  <span className="font-medium">25%</span>
                </div>
                <div className="flex justify-between">
                  <span>Emergency:</span>
                  <span className="font-medium">15%</span>
                </div>
                <div className="flex justify-between">
                  <span>Surgery:</span>
                  <span className="font-medium">15%</span>
                </div>
              </div>
            )}
            {selectedChart === 'revenue' && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Week 1:</span>
                  <span className="font-medium">$2,500</span>
                </div>
                <div className="flex justify-between">
                  <span>Week 2:</span>
                  <span className="font-medium">$3,200</span>
                </div>
                <div className="flex justify-between">
                  <span>Week 3:</span>
                  <span className="font-medium">$2,800</span>
                </div>
                <div className="flex justify-between">
                  <span>Week 4:</span>
                  <span className="font-medium">$4,000</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chart Types */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <BarChart3 className="w-8 h-8 text-blue-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Bar Charts</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">Compare data across different categories</p>
          <div className="bg-gray-50 rounded-lg p-4 h-32 flex items-center justify-center">
            <BarChart3 className="w-12 h-12 text-gray-400" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <PieChart className="w-8 h-8 text-green-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Pie Charts</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">Show proportional data distribution</p>
          <div className="bg-gray-50 rounded-lg p-4 h-32 flex items-center justify-center">
            <PieChart className="w-12 h-12 text-gray-400" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <LineChart className="w-8 h-8 text-purple-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Line Charts</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">Track trends over time</p>
          <div className="bg-gray-50 rounded-lg p-4 h-32 flex items-center justify-center">
            <LineChart className="w-12 h-12 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Chart Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">12</div>
            <div className="text-sm text-gray-600">Chart Types</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">156</div>
            <div className="text-sm text-gray-600">Data Points</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">8</div>
            <div className="text-sm text-gray-600">Active Charts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">24</div>
            <div className="text-sm text-gray-600">Updates Today</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Echarts
