#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🌱 Carbon Credit Marketplace - Setup Script\n');

// Check if we're in the right directory
if (!fs.existsSync('package.json')) {
  console.error('❌ Error: Please run this script from the hackaton directory');
  process.exit(1);
}

// Function to run commands
function runCommand(command, description) {
  console.log(`🔄 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed\n`);
  } catch (error) {
    console.error(`❌ Error during ${description}:`, error.message);
    process.exit(1);
  }
}

// Function to create .env.local if it doesn't exist
function setupEnvironment() {
  const envPath = '.env.local';
  if (!fs.existsSync(envPath)) {
    console.log('🔧 Creating .env.local file...');
    const envContent = `# 🌱 Carbon Credit Marketplace - Local Environment

# 🔗 Blockchain Configuration (Local Development)
NEXT_PUBLIC_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
NEXT_PUBLIC_NETWORK_ID=1337
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545
NEXT_PUBLIC_CHAIN_NAME=Localhost

# 🔧 Development Settings
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Carbon Credit Marketplace
NEXT_PUBLIC_APP_DESCRIPTION=Decentralized carbon credit trading powered by Symbiotic Protocol

# 🔐 Private Keys (for deployment - keep secure!)
# PRIVATE_KEY=your_private_key_here
# INFURA_PROJECT_ID=your_infura_project_id
# ETHERSCAN_API_KEY=your_etherscan_api_key
`;
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env.local created\n');
  } else {
    console.log('✅ .env.local already exists\n');
  }
}

// Main setup process
async function main() {
  try {
    // 1. Install dependencies
    runCommand('npm install', 'Installing dependencies');

    // 2. Setup environment
    setupEnvironment();

    // 3. Compile smart contracts
    runCommand('npm run compile', 'Compiling smart contracts');

    // 4. Run tests
    console.log('🧪 Running tests...');
    try {
      execSync('npm run test', { stdio: 'inherit' });
      console.log('✅ All tests passed\n');
    } catch (error) {
      console.log('⚠️  Some tests failed, but continuing setup...\n');
    }

    // 5. Build the application
    runCommand('npm run build', 'Building application');

    // Success message
    console.log('🎉 Setup completed successfully!\n');
    console.log('📋 Next steps:');
    console.log('1. Start local blockchain: npx hardhat node');
    console.log('2. Deploy contracts: npm run deploy:localhost');
    console.log('3. Create demo data: npm run demo-data');
    console.log('4. Start development server: npm run dev');
    console.log('\n🌐 Your app will be available at: http://localhost:3000');
    console.log('\n🚀 For production deployment:');
    console.log('- Deploy to Vercel: https://vercel.com/new/clone?repository-url=https://github.com/iNeenah/AlepHACKTON/tree/main/hackaton');
    console.log('- See VERCEL_DEPLOY.md for detailed instructions');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run the setup
main();