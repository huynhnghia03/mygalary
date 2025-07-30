import { PrismaClient } from '@prisma/client'

// Khai báo một biến global để lưu trữ instance của PrismaClient
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

// Tạo một instance của PrismaClient, tái sử dụng instance đã có trong môi trường dev
// để tránh tạo quá nhiều kết nối đến database.
export const prisma =
  global.prisma ||
  new PrismaClient({
    // Tùy chọn log để xem các query được thực thi trong lúc dev
    // log: ['query', 'info', 'warn', 'error'],
  })

// Trong môi trường development, gán instance của prisma vào biến global.
// Điều này đảm bảo rằng instance được tái sử dụng qua các lần hot-reload.
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}