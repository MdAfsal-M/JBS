const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

console.log('🔧 JBS Backend Environment Setup');
console.log('================================\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log('✅ .env file already exists');
  
  // Read and check current values
  const envContent = fs.readFileSync(envPath, 'utf8');
  const hasJwtSecret = envContent.includes('JWT_SECRET=');
  const hasMongoUri = envContent.includes('MONGODB_URI=');
  
  console.log(`   JWT_SECRET: ${hasJwtSecret ? '✅ Set' : '❌ Missing'}`);
  console.log(`   MONGODB_URI: ${hasMongoUri ? '✅ Set' : '❌ Missing'}`);
  
  if (hasJwtSecret && hasMongoUri) {
    console.log('\n🎉 Environment is properly configured!');
    console.log('   You can now start the server with: npm run dev');
    process.exit(0);
  }
} else {
  console.log('❌ .env file not found');
}

console.log('\n📝 Creating/updating .env file...\n');

// Generate a secure JWT secret
const jwtSecret = crypto.randomBytes(32).toString('hex');

// Default environment variables
const envContent = `# JWT Configuration
JWT_SECRET=${jwtSecret}

# JWT Expiration
JWT_EXPIRE=24h

# Database Configuration
MONGODB_URI=mongodb+srv://mdafsalm33:zMw0Dtluig6Kiw03@cluster0.ypgm4uz.mongodb.net/jbs_database?retryWrites=true&w=majority&appName=Cluster0

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URLs
FRONTEND_URL=https://jbs1.netlify.app/
ALLOWED_ORIGINS=https://jbs1.netlify.app/

# Email Configuration (optional - uncomment and configure if needed)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password
`;

// Write .env file
try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully!');
  console.log(`   JWT_SECRET: Generated (${jwtSecret.length} characters)`);
  console.log(`   MONGODB_URI: Configured`);
  console.log(`   PORT: 5000`);
  console.log(`   NODE_ENV: development`);
  console.log('\n🎉 Environment setup complete!');
  console.log('   You can now start the server with: npm run dev');
} catch (error) {
  console.error('❌ Failed to create .env file:', error.message);
  console.log('\n📋 Please manually create a .env file with the following content:');
  console.log('=====================================');
  console.log(envContent);
  console.log('=====================================');
  process.exit(1);
}
