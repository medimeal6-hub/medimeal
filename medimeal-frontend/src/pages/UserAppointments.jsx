import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import { loadScript } from '../utils/loadScript'
import { 
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Filter,
  Search,
  Stethoscope,
  CreditCard,
  Download,
  X
} from 'lucide-react'

const UserAppointments = () => {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showBookModal, setShowBookModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [doctors, setDoctors] = useState([])
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [invoiceLoading, setInvoiceLoading] = useState(false)
  const [invoiceError, setInvoiceError] = useState('')
  const [invoiceData, setInvoiceData] = useState(null)
  const [invoiceAppointment, setInvoiceAppointment] = useState(null)
  
  // Booking form state
  const [bookingForm, setBookingForm] = useState({
    doctorId: '',
    date: '',
    time: '',
    type: 'consultation',
    reasonForVisit: '',
    mode: 'in-person'
  })

  useEffect(() => {
    fetchAppointments()
    fetchDoctors()
  }, [])

  const fetchDoctors = async () => {
    try {
      // Fetch available doctors
      const response = await axios.get('/user/doctors')
      if (response.data.success) {
        setDoctors(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching doctors:', error)
    }
  }

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      const userId = user?._id
      if (!userId) return
      
      const response = await axios.get(`/appointments/user/${userId}`)
      if (response.data.success) {
        setAppointments(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
      // Fallback to old endpoint if new one fails
      try {
        const fallbackResponse = await axios.get('/user/appointments')
        if (fallbackResponse.data.success) {
          setAppointments(fallbackResponse.data.data || [])
        }
      } catch (fallbackError) {
        console.error('Fallback endpoint also failed:', fallbackError)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleBookAppointment = async (e) => {
    e.preventDefault()
    try {
      // Use the new unified appointments endpoint
      const response = await axios.post('/appointments/book', bookingForm)
      if (response.data.success) {
        setShowBookModal(false)
        setBookingForm({
          doctorId: '',
          date: '',
          time: '',
          type: 'consultation',
          reasonForVisit: '',
          mode: 'in-person'
        })
        fetchAppointments()
        alert('Appointment confirmed! Please proceed to payment.')
      }
    } catch (error) {
      console.error('Error booking appointment:', error)
      const errorMessage = error.response?.data?.message || 'Failed to book appointment'
      alert(errorMessage)
    }
  }

  const handlePayment = async (appointmentId) => {
    try {
      await loadScript('https://checkout.razorpay.com/v1/checkout.js')
      if (!window.Razorpay) {
        throw new Error('Razorpay SDK failed to load')
      }

      // Create Razorpay order from backend (amount is computed server-side)
      const orderRes = await axios.post(`/appointments/${appointmentId}/pay/razorpay/order`)
      const { keyId, order } = orderRes.data?.data || {}
      if (!keyId || !order?.id) {
        throw new Error('Failed to create Razorpay order')
      }

      const rzp = new window.Razorpay({
        key: keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'MediMeal',
        description: 'Appointment Payment',
        order_id: order.id,
        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true,
        },
        prefill: {
          name: user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
          email: user?.email || '',
          contact: user?.phone || user?.doctorInfo?.phoneNumber || '',
        },
        theme: { color: '#16A34A' },
        handler: async (response) => {
          try {
            const verifyRes = await axios.post(
              `/appointments/${appointmentId}/pay/razorpay/verify`,
              response
            )
            if (verifyRes.data.success) {
              alert('Payment successful! Your appointment is confirmed.')
              fetchAppointments()
            } else {
              alert(verifyRes.data.message || 'Payment verification failed')
            }
          } catch (e) {
            alert(e.response?.data?.message || 'Payment verification failed')
          }
        },
        modal: {
          ondismiss: () => {
            alert('Payment cancelled/closed.')
          },
        },
      })

      rzp.on('payment.failed', function (resp) {
        const msg =
          resp?.error?.description ||
          resp?.error?.reason ||
          resp?.error?.code ||
          'Payment failed'
        alert(msg)
      })

      rzp.open()
    } catch (error) {
      console.error('Error processing payment:', error)
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error?.description ||
        (typeof error.response?.data === 'string' ? error.response.data : '') ||
        error.message ||
        'Payment failed'
      alert(errorMessage)
    }
  }

  const handleOpenInvoice = async (appointment) => {
    try {
      setInvoiceError('')
      setInvoiceData(null)
      setInvoiceAppointment(appointment)
      setShowInvoiceModal(true)
      setInvoiceLoading(true)

      const res = await axios.get(`/user/appointments/${appointment._id}/invoice`)
      if (res.data?.success) {
        setInvoiceData(res.data.data)
      } else {
        setInvoiceError(res.data?.message || 'Failed to load invoice details')
      }
    } catch (e) {
      setInvoiceError(e.response?.data?.message || 'Failed to load invoice details')
    } finally {
      setInvoiceLoading(false)
    }
  }

  const handleDownloadInvoicePdf = async () => {
    try {
      if (!invoiceAppointment?._id) return
      setInvoiceError('')
      setInvoiceLoading(true)

      const res = await axios.get(`/user/appointments/${invoiceAppointment._id}/invoice/pdf`, {
        responseType: 'blob',
      })

      const blob = new Blob([res.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)

      const filenameBase =
        invoiceData?.invoiceNumber ||
        `invoice-${String(invoiceAppointment._id).slice(-8)}`

      const a = document.createElement('a')
      a.href = url
      a.download = `${filenameBase}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (e) {
      setInvoiceError(e.response?.data?.message || 'Failed to download invoice PDF')
    } finally {
      setInvoiceLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const statusUpper = status?.toUpperCase()
    switch (statusUpper) {
      case 'REQUESTED': return 'bg-yellow-100 text-yellow-800'
      case 'APPROVED': return 'bg-blue-100 text-blue-800'
      case 'PAYMENT_PENDING': return 'bg-orange-100 text-orange-800'
      case 'PAID': return 'bg-green-100 text-green-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      case 'CONFIRMED': return 'bg-purple-100 text-purple-800'
      case 'COMPLETED': return 'bg-gray-100 text-gray-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      // Legacy lowercase support
      case 'requested': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-blue-100 text-blue-800'
      case 'paid': return 'bg-green-100 text-green-800'
      case 'confirmed': return 'bg-purple-100 text-purple-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }
  
  const getStatusLabel = (status) => {
    const statusUpper = status?.toUpperCase()
    switch (statusUpper) {
      case 'REQUESTED': return 'Waiting for Approval'
      case 'APPROVED': return 'Approved - Pay Now'
      case 'PAYMENT_PENDING': return 'Payment Pending'
      case 'PAID': return 'Confirmed'
      case 'REJECTED': return 'Rejected'
      case 'CONFIRMED': return 'Confirmed'
      case 'COMPLETED': return 'Completed'
      case 'CANCELLED': return 'Cancelled'
      default: return status || 'Unknown'
    }
  }

  const filteredAppointments = filterStatus === 'all' 
    ? appointments 
    : appointments.filter(apt => apt.status === filterStatus)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
          <p className="text-gray-600 mt-1">Manage your doctor appointments</p>
        </div>
        <button
          onClick={() => setShowBookModal(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Book Appointment
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Filter by status:</span>
          {['all', 'requested', 'approved', 'paid', 'confirmed', 'completed', 'cancelled'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Appointments List */}
      <div className="grid gap-4">
        {filteredAppointments.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
            <p className="text-gray-600 mb-4">Book your first appointment to get started</p>
            <button
              onClick={() => setShowBookModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              Book Appointment
            </button>
          </div>
        ) : (
          filteredAppointments.map((appointment) => (
            <div key={appointment._id} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <Stethoscope className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">{appointment.doctor?.name || appointment.provider?.name || 'Doctor'}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                      {getStatusLabel(appointment.status)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{appointment.date || (appointment.appointmentDate ? new Date(appointment.appointmentDate).toLocaleDateString() : 'N/A')}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{appointment.time || (appointment.appointmentDate ? new Date(appointment.appointmentDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A')}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{appointment.type}</span>
                    </div>
                    {(appointment.doctor?.specialization || appointment.provider?.specialization) && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Stethoscope className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{appointment.doctor?.specialization || appointment.provider?.specialization}</span>
                      </div>
                    )}
                  </div>
                  
                  {appointment.reasonForVisit && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Reason:</span> {appointment.reasonForVisit}
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col space-y-2 ml-4">
                  {(['APPROVED', 'PAYMENT_PENDING'].includes(appointment.status?.toUpperCase()) || appointment.status === 'approved') && (
                    <button
                      onClick={() => handlePayment(appointment._id)}
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pay Now
                    </button>
                  )}
                  {(appointment.status?.toUpperCase() === 'PAID' || appointment.status === 'paid') && (
                    <button
                      type="button"
                      onClick={() => handleOpenInvoice(appointment)}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Invoice
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Invoice Modal (shows payment status before download) */}
      {showInvoiceModal && invoiceAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Invoice Details</h3>
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3 text-sm text-gray-700">
                <div>
                  <span className="font-medium">Payment Status:</span>{' '}
                  <span className="uppercase">{invoiceAppointment.status}</span>
                </div>
                <div>
                  <span className="font-medium">Doctor:</span>{' '}
                  {invoiceAppointment.doctor?.name || invoiceAppointment.provider?.name || 'Doctor'}
                </div>

                {invoiceLoading ? (
                  <div className="text-gray-600">Loading invoice…</div>
                ) : invoiceError ? (
                  <div className="text-gray-600">
                    Invoice details are being generated. You can still download the PDF.
                  </div>
                ) : invoiceData ? (
                  <>
                    <div>
                      <span className="font-medium">Invoice Number:</span> {invoiceData.invoiceNumber || '—'}
                    </div>
                    <div>
                      <span className="font-medium">Transaction ID:</span> {invoiceData.transactionId || '—'}
                    </div>
                    <div>
                      <span className="font-medium">Total:</span>{' '}
                      ₹{Number(invoiceData.totalAmount || 0).toFixed(2)}
                    </div>
                  </>
                ) : null}
              </div>

              <div className="mt-6 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowInvoiceModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleDownloadInvoicePdf}
                  disabled={invoiceLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Book Appointment Modal */}
      {showBookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Book Appointment</h3>
                <button
                  onClick={() => setShowBookModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <form onSubmit={handleBookAppointment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Doctor *</label>
                  <select
                    required
                    value={bookingForm.doctorId}
                    onChange={(e) => setBookingForm({ ...bookingForm, doctorId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Choose a doctor...</option>
                    {doctors.map(doctor => (
                      <option key={doctor._id} value={doctor._id}>
                        Dr. {doctor.firstName} {doctor.lastName} - {doctor.specialization || 'General Physician'}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={bookingForm.date}
                      onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
                    <input
                      type="time"
                      required
                      value={bookingForm.time}
                      onChange={(e) => setBookingForm({ ...bookingForm, time: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Type *</label>
                    <select
                      required
                      value={bookingForm.type}
                      onChange={(e) => setBookingForm({ ...bookingForm, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="consultation">Consultation</option>
                      <option value="follow-up">Follow-up</option>
                      <option value="check-up">Check-up</option>
                      <option value="emergency">Emergency</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mode</label>
                    <select
                      value={bookingForm.mode}
                      onChange={(e) => setBookingForm({ ...bookingForm, mode: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="in-person">In-Person</option>
                      <option value="telemedicine">Telemedicine</option>
                      <option value="phone">Phone</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Visit *</label>
                  <textarea
                    required
                    rows={3}
                    value={bookingForm.reasonForVisit}
                    onChange={(e) => setBookingForm({ ...bookingForm, reasonForVisit: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe your symptoms or reason for the appointment"
                  />
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowBookModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Book Appointment
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserAppointments
