const bcrypt = require('bcryptjs');

async function testPassword() {
  const password = '12345678';
  
  console.log('Testing password:', password);
  
  // Hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  
  console.log('Hashed password:', hashedPassword);
  
  // Test comparison
  const isMatch = await bcrypt.compare(password, hashedPassword);
  console.log('Password match:', isMatch);
  
  // Test wrong password
  const wrongMatch = await bcrypt.compare('wrongpassword', hashedPassword);
  console.log('Wrong password match:', wrongMatch);
}

testPassword().catch(console.error);
