import { NextRequest, NextResponse } from 'next/server'
// import { prisma } from '@/lib/prisma' // Đã import ở trên
import fs from 'fs' // Sử dụng 'fs' cho các hàm đồng bộ
import { prisma } from '@/lib/prisma'
// import path from 'path' // Đã import ở trên

interface RouteContext {
    params: {
        id: string
    }
}

// Xóa ảnh
export async function DELETE(req: NextRequest, { params }: RouteContext) {
    const { id } = params
    try {
        const photo = await prisma.photo.findUnique({
            where: { id },
        })

        if (!photo) {
            return NextResponse.json({ error: 'Không tìm thấy ảnh' }, { status: 404 })
        }

        // Xóa file vật lý bằng đường dẫn tuyệt đối đã lưu trong DB
        // Sử dụng fs đồng bộ để đơn giản hóa
        if (fs.existsSync(photo.path)) {
            fs.unlinkSync(photo.path)
        } else {
            console.warn(`File not found for deletion, but proceeding to delete DB record: ${photo.path}`);
        }

        // Xóa record trong database
        await prisma.photo.delete({
            where: { id },
        })

        return NextResponse.json({ message: 'Xóa ảnh thành công!' }, { status: 200 })
    } catch (error) {
        console.error('Error deleting photo:', error)
        return NextResponse.json({ error: 'Lỗi server khi xóa ảnh' }, { status: 500 })
    }
}

// Cập nhật ảnh (yêu thích)
export async function PATCH(req: NextRequest, { params }: RouteContext) {
    const { id } = params
    try {
        const { isFavorite } = await req.json()
        const photo = await prisma.photo.update({
            where: { id },
            data: { isFavorite },
        })
        return NextResponse.json(photo, { status: 200 })
    } catch (error) {
        console.error('Error updating photo:', error)
        return NextResponse.json({ error: 'Lỗi server khi cập nhật ảnh' }, { status: 500 })
    }
}
