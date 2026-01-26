
// Test Authentication Flow
async function testAuth() {
  console.log('🧪 Testing Authentication...');
  
  try {
    // 1. Test login
    const loginResponse = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@kursus.com',
        password: 'admin123'
      })
    });
    
    console.log('Login status:', loginResponse.status);
    
    if (loginResponse.ok) {
      console.log('✅ Login successful');
      
      // 2. Test protected route
      const templatesResponse = await fetch('/api/certificates/templates');
      console.log('Templates API status:', templatesResponse.status);
      
      if (templatesResponse.ok) {
        console.log('✅ Authentication working!');
      } else {
        console.log('❌ Authentication failing on protected routes');
      }
    } else {
      console.log('❌ Login failed');
    }
  } catch (error) {
    console.log('❌ Auth test error:', error);
  }
}

// Run in browser console
testAuth();
