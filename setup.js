const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Task Manager App...\n');

const backendEnv = `NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/task-manager
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000`;

const frontendEnv = `VITE_API_URL=http://localhost:5000`;

try {
  if (!fs.existsSync('backend/.env')) {
    fs.writeFileSync('backend/.env', backendEnv);
    console.log('✅ Created backend/.env');
  } else {
    console.log('⚠️  backend/.env already exists');
  }

  if (!fs.existsSync('frontend/.env')) {
    fs.writeFileSync('frontend/.env', frontendEnv);
    console.log('✅ Created frontend/.env');
  } else {
    console.log('⚠️  frontend/.env already exists');
  }

  console.log('\n📋 Next steps:');
  console.log('1. Start MongoDB');
  console.log('2. Run: cd backend && npm install && npm run dev');
  console.log('3. Run: cd frontend && npm install && npm run dev');
  console.log('4. Open http://localhost:5173 in your browser');
  
} catch (error) {
  console.error('❌ Error creating environment files:', error.message);
}




