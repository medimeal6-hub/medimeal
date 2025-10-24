// Test authentication token sending
const testAuth = async () => {
  try {
    console.log('=== Authentication Test ===');
    
    // Check if token exists in localStorage
    const token = localStorage.getItem('token');
    console.log('Token in localStorage:', token ? `${token.substring(0, 20)}...` : 'None');
    
    // Check axios default headers
    console.log('Axios Authorization header:', axios.defaults.headers.common['Authorization']);
    
    // Try to make a simple authenticated request
    console.log('Making test request to /api/auth/me...');
    const response = await axios.get('/api/auth/me');
    console.log('Auth test response:', response.data);
    
  } catch (error) {
    console.error('Auth test failed:', error.response?.status, error.response?.data || error.message);
  }
};

// Run the test
testAuth();