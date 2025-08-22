const mongoose = require('mongoose');
const Opportunity = require('./models/Opportunity');

// Database connection
const mongoUri = 'mongodb+srv://mdafsalm33:zMw0Dtluig6Kiw03@cluster0.ypgm4uz.mongodb.net/jbs_database?retryWrites=true&w=majority&appName=Cluster0';

async function testOpportunityCreation() {
  try {
    // Connect to MongoDB
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Test data for a job opportunity
    const testJobData = {
      title: 'Software Developer',
      companyName: 'Test Company',
      location: 'Remote',
      description: 'We are looking for a skilled software developer to join our team.',
      opportunityType: 'Job',
      applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      ownerId: new mongoose.Types.ObjectId(), // Mock owner ID
      salary: '$80,000 - $100,000',
      jobType: 'full-time',
      payType: 'yearly',
      experience: '3+ years',
      requirements: ['JavaScript', 'React', 'Node.js'],
      benefits: ['Health insurance', 'Remote work', 'Flexible hours'],
      isRemote: true,
      isUrgent: false,
      maxApplicants: 50,
      tags: ['software', 'development', 'remote'],
      contactInfo: {
        email: 'hr@testcompany.com',
        phone: '+1-555-0123',
        website: 'https://testcompany.com'
      },
      applicationInstructions: 'Please submit your resume and portfolio.'
    };

    // Create the opportunity
    const opportunity = new Opportunity(testJobData);
    const savedOpportunity = await opportunity.save();
    
    console.log('✅ Opportunity created successfully:');
    console.log('ID:', savedOpportunity._id);
    console.log('Title:', savedOpportunity.title);
    console.log('Company:', savedOpportunity.companyName);
    console.log('Type:', savedOpportunity.opportunityType);
    console.log('Status:', savedOpportunity.status);
    console.log('Posted Date:', savedOpportunity.postedDate);

    // Test retrieving the opportunity
    const retrievedOpportunity = await Opportunity.findById(savedOpportunity._id);
    console.log('\n✅ Opportunity retrieved successfully:');
    console.log('Retrieved Title:', retrievedOpportunity.title);
    console.log('Retrieved Requirements:', retrievedOpportunity.requirements);
    console.log('Retrieved Benefits:', retrievedOpportunity.benefits);

    // Test querying by opportunity type
    const allJobs = await Opportunity.find({ opportunityType: 'Job' });
    console.log(`\n✅ Found ${allJobs.length} job opportunities in database`);

    // Clean up - remove test data
    await Opportunity.findByIdAndDelete(savedOpportunity._id);
    console.log('\n✅ Test opportunity removed from database');

    console.log('\n🎉 All tests passed! The opportunity system is working correctly.');

  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the test
testOpportunityCreation();
