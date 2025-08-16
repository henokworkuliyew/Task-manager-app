const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Task Manager App...\n');

function createEnvFile(dir, content) {
  const envPath = path.join(dir, '.env');
  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, content);
    console.log(`✅ Created ${dir}/.env`);
  } else {
    console.log(`⚠️  ${dir}/.env already exists`);
  }
}

function checkMongoDB() {
  return new Promise((resolve) => {
    const { exec } = require('child_process');
    exec('mongod --version', (error) => {
      if (error) {
        console.log('❌ MongoDB not found. Please install MongoDB first.');
        console.log('   Download from: https://www.mongodb.com/try/download/community');
        resolve(false);
      } else {
        console.log('✅ MongoDB is installed');
        resolve(true);
      }
    });
  });
}

async function startApp() {
  console.log('📋 Setting up environment files...');
  
  const backendEnv = `NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/task-manager
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=1d
FRONTEND_URL=http://localhost:3000`;

  const frontendEnv = `VITE_API_URL=http://localhost:5000`;

  createEnvFile('backend', backendEnv);
  createEnvFile('frontend', frontendEnv);

  console.log('\n🔍 Checking prerequisites...');
  const mongoInstalled = await checkMongoDB();

  if (!mongoInstalled) {
    console.log('\n❌ Please install MongoDB and try again.');
    return;
  }

  console.log('\n📦 Installing dependencies...');
  
  console.log('Installing backend dependencies...');
  const backendInstall = spawn('npm', ['install'], { cwd: './backend', stdio: 'inherit' });
  
  backendInstall.on('close', (code) => {
    if (code === 0) {
      console.log('✅ Backend dependencies installed');
      
      console.log('Installing frontend dependencies...');
      const frontendInstall = spawn('npm', ['install'], { cwd: './frontend', stdio: 'inherit' });
      
      frontendInstall.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Frontend dependencies installed');
          
          console.log('\n🎯 Starting servers...');
          console.log('Starting backend server...');
          
          const backend = spawn('npm', ['run', 'dev'], { cwd: './backend', stdio: 'inherit' });
          
          setTimeout(() => {
            console.log('Starting frontend server...');
            const frontend = spawn('npm', ['run', 'dev'], { cwd: './frontend', stdio: 'inherit' });
            
            console.log('\n🌐 Application URLs:');
            console.log('Frontend: http://localhost:5173');
            console.log('Backend API: http://localhost:5000');
            console.log('Health Check: http://localhost:5000/api/health');
            
            console.log('\n📝 Next steps:');
            console.log('1. Open http://localhost:5173 in your browser');
            console.log('2. Register a new account');
            console.log('3. Start creating tasks!');
            
            process.on('SIGINT', () => {
              console.log('\n🛑 Shutting down servers...');
              backend.kill();
              frontend.kill();
              process.exit(0);
            });
          }, 3000);
        } else {
          console.log('❌ Frontend dependencies installation failed');
        }
      });
    } else {
      console.log('❌ Backend dependencies installation failed');
    }
  });
}

startApp();




