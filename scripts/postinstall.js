const { execSync } = require('child_process');

// Chạy các lệnh cần thiết sau khi install
async function main() {
  try {
    console.log('Running prisma generate...');
    execSync('npx prisma generate', { stdio: 'inherit' });

    // Trong development, luôn chạy db push để cập nhật schema
    if (process.env.NODE_ENV !== 'production') {
      console.log('Running development database setup...');
      execSync('npx prisma db push', { stdio: 'inherit' });
    }
  } catch (error) {
    console.error('Error during postinstall:', error);
    process.exit(1);
  }
}

main();
