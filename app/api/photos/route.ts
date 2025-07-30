import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const search = searchParams.get('search')
        const favorite = searchParams.get('favorite')

        const where: any = {}

        if (search) {
            where.originalName = {
                contains: search,
                mode: 'insensitive',
            }
        }

        if (favorite === 'true') {
            where.isFavorite = true
        }

        const photos = await prisma.photo.findMany({
            where,
            orderBy: {
                uploadedAt: 'desc',
            },
        })

        return NextResponse.json(photos, { status: 200 })
    } catch (error) {
        console.error('Error fetching photos:', error)
        return NextResponse.json({ error: 'Lỗi server khi lấy danh sách ảnh' }, { status: 500 })
    }
}