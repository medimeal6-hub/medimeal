import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { 
  HelpCircle,
  Search,
  MessageCircle,
  Phone,
  Mail,
  FileText,
  Video,
  BookOpen,
  Settings,
  Download,
  Send,
  Clock,
  User,
  CheckCircle
} from 'lucide-react'

const HelpCenter = () => {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showContactForm, setShowContactForm] = useState(false)
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: '',
    priority: 'medium'
  })

  const helpCategories = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: '📊',
      articles: [
        { id: 1, title: 'How to navigate the dashboard', views: 1250 },
        { id: 2, title: 'Understanding patient metrics', views: 890 },
        { id: 3, title: 'Customizing dashboard widgets', views: 650 }
      ]
    },
    {
      id: 'schedules',
      title: 'Schedules',
      icon: '📅',
      articles: [
        { id: 4, title: 'Creating new schedules', views: 1100 },
        { id: 5, title: 'Managing time slots', views: 950 },
        { id: 6, title: 'Calendar integration', views: 720 }
      ]
    },
    {
      id: 'patients',
      title: 'Patients',
      icon: '👥',
      articles: [
        { id: 7, title: 'Adding new patients', views: 1400 },
        { id: 8, title: 'Patient information management', views: 1200 },
        { id: 9, title: 'Patient history tracking', views: 980 }
      ]
    },
    {
      id: 'appointments',
      title: 'Appointments',
      icon: '📋',
      articles: [
        { id: 10, title: 'Scheduling appointments', views: 1300 },
        { id: 11, title: 'Managing appointment status', views: 1050 },
        { id: 12, title: 'Appointment reminders', views: 800 }
      ]
    },
    {
      id: 'billing',
      title: 'Billing',
      icon: '💰',
      articles: [
        { id: 13, title: 'Payment processing', views: 1150 },
        { id: 14, title: 'Invoice generation', views: 900 },
        { id: 15, title: 'Financial reports', views: 750 }
      ]
    },
    {
      id: 'technical',
      title: 'Technical Support',
      icon: '🔧',
      articles: [
        { id: 16, title: 'System requirements', views: 600 },
        { id: 17, title: 'Troubleshooting guide', views: 850 },
        { id: 18, title: 'Data backup and restore', views: 500 }
      ]
    }
  ]

  const faqs = [
    {
      question: 'How do I reset my password?',
      answer: 'Go to Settings > Account > Security and click "Reset Password". You will receive an email with instructions.',
      category: 'account'
    },
    {
      question: 'How can I export patient data?',
      answer: 'Navigate to Patients section, select the patients you want to export, and click the Export button.',
      category: 'patients'
    },
    {
      question: 'What payment methods are supported?',
      answer: 'We support credit cards, bank transfers, insurance billing, and cash payments.',
      category: 'billing'
    },
    {
      question: 'How do I schedule recurring appointments?',
      answer: 'When creating a new appointment, check the "Recurring" option and set the frequency.',
      category: 'appointments'
    },
    {
      question: 'Can I customize the dashboard layout?',
      answer: 'Yes, you can drag and drop widgets to rearrange your dashboard layout.',
      category: 'dashboard'
    }
  ]

  const filteredArticles = helpCategories
    .filter(category => selectedCategory === 'all' || category.id === selectedCategory)
    .flatMap(category => category.articles)
    .filter(article => 
      article.title.toLowerCase().includes(searchTerm.toLowerCase())
    )

  const handleContactSubmit = (e) => {
    e.preventDefault()
    // Handle contact form submission
    console.log('Contact form submitted:', contactForm)
    setShowContactForm(false)
    setContactForm({ subject: '', message: '', priority: 'medium' })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Help Center</h1>
          <p className="text-gray-600 mt-1">Find answers, get support, and learn how to use the system</p>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setShowContactForm(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Contact Support
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search help articles, FAQs, and documentation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Quick Help */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <BookOpen className="w-8 h-8 text-blue-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Documentation</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">Comprehensive guides and tutorials</p>
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            Browse Documentation →
          </button>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <Video className="w-8 h-8 text-green-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Video Tutorials</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">Step-by-step video guides</p>
          <button className="text-green-600 hover:text-green-800 text-sm font-medium">
            Watch Videos →
          </button>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <Phone className="w-8 h-8 text-purple-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Live Support</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">Get help from our support team</p>
          <button className="text-purple-600 hover:text-purple-800 text-sm font-medium">
            Start Chat →
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Help Categories</h3>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {helpCategories.map(category => (
              <option key={category.id} value={category.id}>{category.title}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {helpCategories.map(category => (
            <div key={category.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-3">{category.icon}</span>
                <h4 className="font-semibold text-gray-900">{category.title}</h4>
              </div>
              <div className="space-y-2">
                {category.articles.map(article => (
                  <div key={article.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 hover:text-blue-600 cursor-pointer">
                      {article.title}
                    </span>
                    <span className="text-gray-400">{article.views} views</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Frequently Asked Questions</h3>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">{faq.question}</h4>
              <p className="text-gray-600 text-sm">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Support Modal */}
      {showContactForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowContactForm(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Contact Support</h3>
                <button
                  onClick={() => setShowContactForm(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input
                    type="text"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Brief description of your issue"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={contactForm.priority}
                    onChange={(e) => setContactForm({...contactForm, priority: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    rows={4}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe your issue in detail..."
                    required
                  />
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowContactForm(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Send className="w-4 h-4 mr-2 inline" />
                    Send Message
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Support Stats */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Support Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">24/7</div>
            <div className="text-sm text-gray-600">Support Available</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">&lt;2min</div>
            <div className="text-sm text-gray-600">Response Time</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">98%</div>
            <div className="text-sm text-gray-600">Satisfaction Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">150+</div>
            <div className="text-sm text-gray-600">Help Articles</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HelpCenter
