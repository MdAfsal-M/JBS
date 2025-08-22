const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

// Test student registration
const testStudentRegistration = async () => {
  try {
    console.log('🧪 Testing Student Registration...');
    
    const studentData = {
      fullName: "John Student",
      email: "john.student@example.com",
      password: "StudentPass123!",
      dob: "2000-01-01",
      gender: "male",
      phone: "+1234567890",
      city: "New York",
      address: "123 Student St",
      education: "Computer Science",
      institution: "Tech University",
      graduationYear: 2024,
      skills: ["JavaScript", "React", "Node.js"]
    };

    const response = await axios.post(`${API_BASE_URL}/auth/student/register`, studentData);
    
    console.log('✅ Student Registration Successful!');
    console.log('Token:', response.data.token);
    console.log('User ID:', response.data.user.id);
    
    return response.data.token;
  } catch (error) {
    console.error('❌ Student Registration Failed:', error.response?.data || error.message);
    return null;
  }
};

// Test student dashboard
const testStudentDashboard = async (token) => {
  try {
    console.log('\n🧪 Testing Student Dashboard...');
    
    const response = await axios.get(`${API_BASE_URL}/student/dashboard`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('✅ Student Dashboard Successful!');
    console.log('Profile:', response.data.data.profile.firstName);
    console.log('Applications:', response.data.data.applications.length);
    console.log('Recommended Jobs:', response.data.data.recommendedJobs.length);
    
  } catch (error) {
    console.error('❌ Student Dashboard Failed:', error.response?.data || error.message);
  }
};

// Test student profile
const testStudentProfile = async (token) => {
  try {
    console.log('\n🧪 Testing Student Profile...');
    
    const response = await axios.get(`${API_BASE_URL}/student/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('✅ Student Profile Successful!');
    console.log('Education:', response.data.data.student.education);
    console.log('Institution:', response.data.data.student.institution);
    console.log('Skills:', response.data.data.student.skills);
    
  } catch (error) {
    console.error('❌ Student Profile Failed:', error.response?.data || error.message);
  }
};

// Test student profile update
const testStudentProfileUpdate = async (token) => {
  try {
    console.log('\n🧪 Testing Student Profile Update...');
    
    const updateData = {
      student: {
        cgpa: 8.5,
        currentSemester: 3,
        skills: ["JavaScript", "React", "Node.js", "Python", "MongoDB"]
      }
    };
    
    const response = await axios.put(`${API_BASE_URL}/student/profile`, updateData, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('✅ Student Profile Update Successful!');
    console.log('Updated CGPA:', response.data.data.student.cgpa);
    console.log('Updated Skills:', response.data.data.student.skills);
    
  } catch (error) {
    console.error('❌ Student Profile Update Failed:', error.response?.data || error.message);
  }
};

// Test student applications
const testStudentApplications = async (token) => {
  try {
    console.log('\n🧪 Testing Student Applications...');
    
    const response = await axios.get(`${API_BASE_URL}/student/applications`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('✅ Student Applications Successful!');
    console.log('Total Applications:', response.data.pagination.total);
    console.log('Applications:', response.data.data.length);
    
  } catch (error) {
    console.error('❌ Student Applications Failed:', error.response?.data || error.message);
  }
};

// Main test function
const runTests = async () => {
  console.log('🚀 Starting Student Backend Tests...\n');
  
  // Test student registration
  const token = await testStudentRegistration();
  
  if (token) {
    // Test other endpoints
    await testStudentDashboard(token);
    await testStudentProfile(token);
    await testStudentProfileUpdate(token);
    await testStudentApplications(token);
  }
  
  console.log('\n🎉 Student Backend Tests Completed!');
};

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };
