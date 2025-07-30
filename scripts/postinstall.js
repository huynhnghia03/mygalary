const { execSync } = require('child_process');

// Chạy các lệnh cần thiết sau khi install
async function main() {
  try {
    console.log('Running prisma generate...');
    execSync('npx prisma generate', { stdio: 'inherit' });

    // Chỉ chạy migration trong môi trường production
    if (process.env.NODE_ENV === 'production') {
      console.log('Running database migrations...');
      execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
    }
  } catch (error) {
    console.error('Error during postinstall:', error);
    process.exit(1);
  }
}

main();
