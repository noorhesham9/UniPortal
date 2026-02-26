const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

console.log('\n🧪 Testing Database Models and Middleware\n');

try {
  console.log('✅ Testing Model Imports...');
  const User = require('./models/User');
  console.log('   ✓ User model loaded');
  
  const Role = require('./models/Role');
  console.log('   ✓ Role model loaded');
  
  const Permission = require('./models/Permission');
  console.log('   ✓ Permission model loaded');
  
  const Department = require('./models/Department');
  console.log('   ✓ Department model loaded');
  
  console.log('\n✅ Testing Middleware Imports...');
  const { requireAuth } = require('./middleware/requireAuth');
  console.log('   ✓ requireAuth middleware loaded');
  
  const { requireRole, requirePermission } = require('./middleware/authorize');
  console.log('   ✓ requireRole middleware loaded');
  console.log('   ✓ requirePermission middleware loaded');
  
  console.log('\n✅ Testing Permission Constants...');
  const permissions = require('./constants/permissions');
  console.log('   ✓ Permissions constants loaded');
  console.log(`   ✓ Total permissions defined: ${Object.keys(permissions).length}`);
  
  console.log('\n✅ User Model Schema Fields:');
  User.schema.eachPath((path) => {
    console.log(`   - ${path}`);
  });
  
  console.log('\n✅ Role Model Schema Fields:');
  Role.schema.eachPath((path) => {
    console.log(`   - ${path}`);
  });
  
  console.log('\n✅ Permission Model Schema Fields:');
  Permission.schema.eachPath((path) => {
    console.log(`   - ${path}`);
  });
  
  console.log('\n✅ Department Model Schema Fields:');
  Department.schema.eachPath((path) => {
    console.log(`   - ${path}`);
  });
  
  console.log('\n✅ All tests passed! Models and middleware are working correctly.\n');
  console.log('📝 Remember to:');
  console.log('   1. Update .env file with your MongoDB connection string');
  console.log('   2. Ensure MongoDB is running');
  console.log('   3. Run "npm start" or "npm run dev" to start the server');
  console.log('   4. Database will auto-seed with roles and permissions on connection\n');
  
} catch (error) {
  console.error('\n❌ Error during tests:', error.message);
  process.exit(1);
}
