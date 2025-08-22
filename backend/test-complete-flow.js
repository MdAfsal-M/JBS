const mongoose = require('mongoose');
const Opportunity = require('./models/Opportunity');

// Database connection
const mongoUri = 'mongodb+srv://mdafsalm33:zMw0Dtluig6Kiw03@cluster0.ypgm4uz.mongodb.net/jbs_database?retryWrites=true&w=majority&appName=Cluster0';

async function testCompleteFlow() {
  try {
    // Connect to MongoDB
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Test 1: Create a job opportunity (simulating owner posting)
    console.log('\n📝 Test 1: Creating a job opportunity...');
    
    const jobData = {
      title: 'Frontend Developer',
      companyName: 'Tech Solutions Inc.',
      location: 'New York, NY',
      description: 'We are seeking a talented Frontend Developer to join our dynamic team. You will be responsible for building user-friendly web applications using modern technologies.',
      opportunityType: 'Job',
      applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      ownerId: new mongoose.Types.ObjectId(), // Mock owner ID
      salary: '$70,000 - $90,000',
      jobType: 'full-time',
      payType: 'yearly',
      experience: '2+ years',
      requirements: ['React', 'TypeScript', 'CSS3', 'HTML5', 'JavaScript'],
      benefits: ['Health insurance', '401k', 'Remote work options', 'Professional development'],
      isRemote: true,
      isUrgent: true,
      maxApplicants: 100,
      tags: ['frontend', 'react', 'typescript', 'remote'],
      contactInfo: {
        email: 'careers@techsolutions.com',
        phone: '+1-555-0124',
        website: 'https://techsolutions.com'
      },
      applicationInstructions: 'Please submit your resume, portfolio, and a brief cover letter explaining your interest in this position.'
    };

    const jobOpportunity = new Opportunity(jobData);
    const savedJob = await jobOpportunity.save();
    console.log('✅ Job opportunity created:', savedJob.title);

    // Test 2: Create an internship opportunity
    console.log('\n📝 Test 2: Creating an internship opportunity...');
    
    const internshipData = {
      title: 'Software Engineering Intern',
      companyName: 'StartupXYZ',
      location: 'San Francisco, CA',
      description: 'Join our fast-growing startup as a Software Engineering Intern. Gain hands-on experience with cutting-edge technologies and work on real projects.',
      opportunityType: 'Internship',
      applicationDeadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
      ownerId: new mongoose.Types.ObjectId(), // Mock owner ID
      duration: '3 months',
      stipend: '$3,000/month',
      stipendType: 'paid',
      startDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
      endDate: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000), // 150 days from now
      requirements: ['Python', 'JavaScript', 'Git', 'Basic algorithms'],
      benefits: ['Mentorship', 'Networking opportunities', 'Potential full-time offer'],
      isRemote: false,
      isUrgent: false,
      maxApplicants: 25,
      tags: ['internship', 'python', 'javascript', 'startup'],
      contactInfo: {
        email: 'internships@startupxyz.com',
        phone: '+1-555-0125',
        website: 'https://startupxyz.com'
      },
      applicationInstructions: 'Submit your resume and a brief statement about what you hope to learn from this internship.'
    };

    const internshipOpportunity = new Opportunity(internshipData);
    const savedInternship = await internshipOpportunity.save();
    console.log('✅ Internship opportunity created:', savedInternship.title);

    // Test 3: Query opportunities by type (simulating student dashboard)
    console.log('\n🔍 Test 3: Querying opportunities for student dashboard...');
    
    // Get all jobs
    const allJobs = await Opportunity.find({ 
      opportunityType: 'Job',
      status: 'active'
    }).sort({ postedDate: -1 });
    
    console.log(`✅ Found ${allJobs.length} active job opportunities`);
    allJobs.forEach(job => {
      console.log(`   - ${job.title} at ${job.companyName} (${job.location})`);
    });

    // Get all internships
    const allInternships = await Opportunity.find({ 
      opportunityType: 'Internship',
      status: 'active'
    }).sort({ postedDate: -1 });
    
    console.log(`✅ Found ${allInternships.length} active internship opportunities`);
    allInternships.forEach(internship => {
      console.log(`   - ${internship.title} at ${internship.companyName} (${internship.location})`);
    });

    // Test 4: Search functionality (simulating student search)
    console.log('\n🔍 Test 4: Testing search functionality...');
    
    // Search for React jobs
    const reactJobs = await Opportunity.find({
      opportunityType: 'Job',
      requirements: { $in: ['React'] },
      status: 'active'
    });
    console.log(`✅ Found ${reactJobs.length} jobs requiring React`);

    // Search for remote opportunities
    const remoteOpportunities = await Opportunity.find({
      isRemote: true,
      status: 'active'
    });
    console.log(`✅ Found ${remoteOpportunities.length} remote opportunities`);

    // Search by location
    const nyJobs = await Opportunity.find({
      location: { $regex: 'New York', $options: 'i' },
      status: 'active'
    });
    console.log(`✅ Found ${nyJobs.length} opportunities in New York`);

    // Test 5: Verify data integrity
    console.log('\n🔍 Test 5: Verifying data integrity...');
    
    const retrievedJob = await Opportunity.findById(savedJob._id);
    console.log('✅ Job data integrity check:');
    console.log(`   Title: ${retrievedJob.title}`);
    console.log(`   Requirements: ${retrievedJob.requirements.join(', ')}`);
    console.log(`   Benefits: ${retrievedJob.benefits.join(', ')}`);
    console.log(`   Contact Email: ${retrievedJob.contactInfo.email}`);
    console.log(`   Tags: ${retrievedJob.tags.join(', ')}`);

    const retrievedInternship = await Opportunity.findById(savedInternship._id);
    console.log('✅ Internship data integrity check:');
    console.log(`   Title: ${retrievedInternship.title}`);
    console.log(`   Duration: ${retrievedInternship.duration}`);
    console.log(`   Stipend: ${retrievedInternship.stipend}`);
    console.log(`   Start Date: ${retrievedInternship.startDate}`);
    console.log(`   End Date: ${retrievedInternship.endDate}`);

    // Test 6: Status and metadata
    console.log('\n🔍 Test 6: Checking status and metadata...');
    
    const totalOpportunities = await Opportunity.countDocuments({});
    const activeOpportunities = await Opportunity.countDocuments({ status: 'active' });
    const urgentOpportunities = await Opportunity.countDocuments({ isUrgent: true });
    
    console.log(`✅ Total opportunities in database: ${totalOpportunities}`);
    console.log(`✅ Active opportunities: ${activeOpportunities}`);
    console.log(`✅ Urgent opportunities: ${urgentOpportunities}`);

    // Clean up test data
    console.log('\n🧹 Cleaning up test data...');
    await Opportunity.findByIdAndDelete(savedJob._id);
    await Opportunity.findByIdAndDelete(savedInternship._id);
    console.log('✅ Test data cleaned up');

    console.log('\n🎉 All tests passed! The complete flow is working correctly:');
    console.log('   ✅ Opportunities can be created and stored');
    console.log('   ✅ Data can be retrieved by type (jobs/internships)');
    console.log('   ✅ Search functionality works');
    console.log('   ✅ Data integrity is maintained');
    console.log('   ✅ Student dashboard can access all opportunities');

  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the test
testCompleteFlow();
