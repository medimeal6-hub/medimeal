import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { 
  Heart, 
  Shield, 
  Users, 
  Brain, 
  ArrowRight, 
  CheckCircle, 
  Star,
  Play,
  Menu,
  X,
  Zap,
  Award
} from 'lucide-react'

const Home = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [stats, setStats] = useState({
    mealPlansCreated: 0,
    successRate: 0,
    healthcarePartners: 0,
    expertSupport: '24/7'
  })
  const [displayStats, setDisplayStats] = useState({
    mealPlansCreated: 0,
    successRate: 0,
    healthcarePartners: 0
  })

  // Fetch statistics from backend (real-time updates every 5 seconds)
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('/analytics/public')
        if (response.data.success) {
          setStats(response.data.data)
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
        // Use fallback values
        setStats({
          mealPlansCreated: 50000,
          successRate: 98,
          healthcarePartners: 500,
          expertSupport: '24/7'
        })
      }
    }

    // Fetch immediately
    fetchStats()
    
    // Set up interval to fetch every 5 seconds for real-time updates
    const intervalId = setInterval(fetchStats, 5000)
    
    // Cleanup interval on unmount
    return () => clearInterval(intervalId)
  }, [])

  // Animate count-up effect with smooth real-time transitions
  useEffect(() => {
    const duration = 1000 // 1 second for smooth transitions
    const steps = 30

    const updateCount = (start, end, setter) => {
      let current = start
      const increment = (end - start) / steps
      const timer = setInterval(() => {
        current += increment
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
          setter(end)
          clearInterval(timer)
        } else {
          setter(Math.floor(current))
        }
      }, duration / steps)
      return timer
    }

    // Only animate if there's a change in values
    const timers = [
      updateCount(displayStats.mealPlansCreated, stats.mealPlansCreated, (val) => 
        setDisplayStats(prev => ({ ...prev, mealPlansCreated: val }))
      ),
      updateCount(displayStats.successRate, stats.successRate, (val) => 
        setDisplayStats(prev => ({ ...prev, successRate: val }))
      ),
      updateCount(displayStats.healthcarePartners, stats.healthcarePartners, (val) => 
        setDisplayStats(prev => ({ ...prev, healthcarePartners: val }))
      )
    ]

    return () => {
      timers.forEach(timer => clearInterval(timer))
    }
  }, [stats, displayStats])

  return (
    <div className="min-h-screen relative">
      {/* Background Image with Mixed Fruits */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat bg-fixed"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1610832958506-aa56368176cf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')",
          filter: "contrast(1.1) brightness(1.05) saturate(1.1)"
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">MediMeal</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">How it Works</a>
              <a href="#testimonials" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Reviews</a>
              <Link to="/login" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Sign In</Link>
              <Link 
                to="/register" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full font-semibold transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile menu button */}
            <button 
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100">
            <div className="px-4 py-2 space-y-1">
              <a href="#features" className="block py-2 text-gray-600 hover:text-blue-600">Features</a>
              <a href="#how-it-works" className="block py-2 text-gray-600 hover:text-blue-600">How it Works</a>
              <a href="#testimonials" className="block py-2 text-gray-600 hover:text-blue-600">Reviews</a>
              <Link to="/login" className="block py-2 text-gray-600 hover:text-blue-600">Sign In</Link>
              <Link to="/register" className="block py-2 text-blue-600 font-semibold">Get Started</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-white/70 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            {/* Trust Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-full text-blue-700 text-sm font-medium mb-8">
              <Award className="w-4 h-4 mr-2" />
              Trusted by 10,000+ Users & Healthcare Professionals
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Nutrition That Works With Your
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"> Medicine</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              Get AI-powered meal plans designed around your medications, health conditions, and allergies. 
              Finally, nutrition that enhances your treatment instead of interfering with it.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link 
                to="/register" 
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-200 shadow-xl hover:shadow-blue-500/25 hover:scale-105 flex items-center justify-center"
              >
                Start Free Assessment
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>

            </div>

            {/* Social Proof */}
            <div className="flex items-center justify-center space-x-8 text-gray-500 text-sm">
              <div className="flex items-center">
                <Star className="h-5 w-5 text-yellow-400 mr-1" />
                <span className="font-semibold text-gray-700">4.9/5</span>
                <span className="ml-1">from 2,500+ reviews</span>
              </div>
              <div className="hidden sm:block w-px h-6 bg-gray-300"></div>
              <div className="hidden sm:flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-1" />
                <span>HIPAA Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats Bar */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {displayStats.mealPlansCreated >= 1000 
                  ? `${(displayStats.mealPlansCreated / 1000).toFixed(0)}K+`
                  : `${displayStats.mealPlansCreated}+`}
              </div>
              <div className="text-gray-600 font-medium">Meal Plans Created</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">{displayStats.successRate}%</div>
              <div className="text-gray-600 font-medium">Success Rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {displayStats.healthcarePartners >= 100 
                  ? `${Math.floor(displayStats.healthcarePartners / 100) * 100}+`
                  : `${displayStats.healthcarePartners}+`}
              </div>
              <div className="text-gray-600 font-medium">Healthcare Partners</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-2">{stats.expertSupport}</div>
              <div className="text-gray-600 font-medium">Expert Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why MediMeal is Different
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The only platform that creates meal plans specifically designed around your medications and health needs
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="text-center group">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-600 transition-colors duration-300">
                <Brain className="h-8 w-8 text-blue-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">AI-Powered Analysis</h3>
              <p className="text-gray-600 leading-relaxed">
                Advanced algorithms analyze drug-nutrient interactions and optimize meal timing for your medications
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center group">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-green-600 transition-colors duration-300">
                <Shield className="h-8 w-8 text-green-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Safety First</h3>
              <p className="text-gray-600 leading-relaxed">
                Comprehensive allergen screening and contraindication alerts to keep you safe with every meal
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center group">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-600 transition-colors duration-300">
                <Users className="h-8 w-8 text-purple-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Doctor Integration</h3>
              <p className="text-gray-600 leading-relaxed">
                Share your nutrition plans with healthcare providers and get real-time guidance from professionals
              </p>
            </div>

            {/* Feature 4 */}
            <div className="text-center group">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-orange-600 transition-colors duration-300">
                <Zap className="h-8 w-8 text-orange-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Real-time Tracking</h3>
              <p className="text-gray-600 leading-relaxed">
                Monitor your health metrics, symptoms, and nutritional adherence with intelligent insights
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Get Started in 3 Simple Steps
            </h2>
            <p className="text-xl text-gray-600">
              From assessment to personalized meal plan in minutes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 h-full">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center text-xl font-bold mb-6">
                  1
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Complete Health Assessment</h3>
                <p className="text-gray-600 leading-relaxed">
                  Tell us about your medications, health conditions, allergies, and dietary preferences in our secure questionnaire.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 h-full">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center text-xl font-bold mb-6">
                  2
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">AI Creates Your Plan</h3>
                <p className="text-gray-600 leading-relaxed">
                  Our AI analyzes your data and creates a personalized meal plan that works with your medications and health goals.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 h-full">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center text-xl font-bold mb-6">
                  3
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Start Your Journey</h3>
                <p className="text-gray-600 leading-relaxed">
                  Get your meal plan, shopping lists, and medication reminders. Track your progress and adjust as needed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Real Results from Real People
            </h2>
            <p className="text-xl text-gray-600">
              See how MediMeal has helped thousands improve their health
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                "My blood sugar is finally stable! The meal plans work perfectly with my diabetes medication schedule. I wish I found this sooner."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-blue-600 font-semibold">AS</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Akhil S.</p>
                  <p className="text-gray-600 text-sm">Diabetes Type 2</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                "As a cardiologist, I recommend MediMeal to my patients. The medication-aware meal planning is exactly what we need in healthcare."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-green-600 font-semibold">DR</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Dr. Ravi Patel</p>
                  <p className="text-gray-600 text-sm">Cardiologist</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                "No more food allergies or reactions! The app automatically filters out everything I can't eat. It's been life-changing."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-purple-600 font-semibold">PK</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Priya Kumar</p>
                  <p className="text-gray-600 text-sm">Multiple Allergies</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Health?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands who have improved their health with personalized, medication-aware nutrition plans.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/register" 
              className="w-full sm:w-auto bg-white text-blue-600 hover:bg-gray-50 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-200 shadow-xl hover:scale-105 flex items-center justify-center"
            >
              Start Your Free Assessment
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link 
              to="/login" 
              className="w-full sm:w-auto border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-200 flex items-center justify-center"
            >
              Sign In
            </Link>
          </div>
          <p className="text-blue-200 text-sm mt-6">
            No credit card required • HIPAA compliant • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">MediMeal</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                The only nutrition platform designed specifically for people on medications. 
                Get meal plans that work with your treatment, not against it.
              </p>
              <p className="text-sm text-gray-500">
                © 2025 MediMeal. All rights reserved.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
      </div>
    </div>
  )
}

export default Home