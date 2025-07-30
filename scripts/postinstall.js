// postinstall.js
const { execSync } = require('child_process');

try {
  // Chạy Prisma generate
  execSync('prisma generate', { stdio: 'inherit' });
} catch (error) {
  console.error('Error during postinstall:', error);
  process.exit(1);
}
