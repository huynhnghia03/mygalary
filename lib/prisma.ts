import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ['error', 'warn'],
    errorFormat: 'pretty',
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  })
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma
}

// Kiểm tra kết nối
prisma.$connect()
  .then(() => {
    console.log('Successfully connected to database')
  })
  .catch((e:any) => {
    console.error('Error connecting to database:', e)
  })

export { prisma }
