import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0;
import { prisma } from '@/lib/prisma';
import { getImageMetadata } from '@/lib/imageProcessor';
import path from 'path';
import { writeFile, mkdir } from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
    try {
        if (req.method !== 'POST') {
            return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
        }

        const formData = await req.formData();
        const files = formData.getAll('photos') as File[];

        if (files.length === 0) {
            return NextResponse.json({ error: 'Không có file nào được upload' }, { status: 400 });
        }

        const savedPhotos = [];
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        
        // Đảm bảo thư mục uploads tồn tại
        await mkdir(uploadsDir, { recursive: true });

        for (const file of files) {
            // Bỏ qua nếu không phải file ảnh
            if (!file.type.startsWith('image/')) {
                console.warn(`Đã bỏ qua file không phải ảnh: ${file.name}`);
                continue;
            }

            // Chuyển file thành ArrayBuffer
            const bytes = await file.arrayBuffer();
            
            // Tạo tên file duy nhất
            const uniqueFilename = `${uuidv4()}${path.extname(file.name)}`;
            const filePath = path.join(uploadsDir, uniqueFilename);

            // Ghi file vào ổ đĩa
            await writeFile(filePath, new Uint8Array(bytes));

            // Lấy thông tin metadata từ file đã lưu
            const { width, height } = await getImageMetadata(filePath);

            const photo = await prisma.photo.create({
                data: {
                    originalName: file.name,
                    size: file.size,
                    width,
                    height,
                    url: `/uploads/${uniqueFilename}`, // URL công khai
                },
            });

            savedPhotos.push(photo);
        }
        
        if (savedPhotos.length === 0) {
            return NextResponse.json({ error: 'Không có file ảnh hợp lệ nào được upload' }, { status: 400 });
        }

        return NextResponse.json({
            message: 'Upload thành công!',
            photos: savedPhotos,
        }, { status: 200 });

    } catch (error: any) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: `Lỗi server khi upload: ${error.message}` }, { status: 500 });
    }
}