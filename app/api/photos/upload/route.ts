import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0;
export const maxDuration = 300; // Tăng timeout lên 5 phút

import { prisma } from '@/lib/prisma';
import { getImageMetadata } from '@/lib/imageProcessor';
import path from 'path';
import { writeFile, mkdir } from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
    try {
        console.log('Starting file upload process...');
        
        if (req.method !== 'POST') {
            return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
        }

        const formData = await req.formData();
        const files = formData.getAll('photos') as File[];

        if (files.length === 0) {
            return NextResponse.json({ error: 'Không có file nào được upload' }, { status: 400 });
        }

        console.log(`Processing ${files.length} files...`);

        const savedPhotos = [];
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        
        // Đảm bảo thư mục uploads tồn tại
        try {
            await mkdir(uploadsDir, { recursive: true });
            console.log('Upload directory created/verified successfully');
        } catch (error) {
            console.error('Error creating upload directory:', error);
            return NextResponse.json({ error: 'Không thể tạo thư mục upload' }, { status: 500 });
        }

        for (const file of files) {
            // Bỏ qua nếu không phải file ảnh
            if (!file.type.startsWith('image/')) {
                console.warn(`Đã bỏ qua file không phải ảnh: ${file.name}`);
                continue;
            }

            try {
                console.log(`Processing file: ${file.name}`);
                
                // Chuyển file thành ArrayBuffer
                const bytes = await file.arrayBuffer();
                console.log('File converted to ArrayBuffer');
                
                // Tạo tên file duy nhất
                const uniqueFilename = `${uuidv4()}${path.extname(file.name)}`;
                const filePath = path.join(uploadsDir, uniqueFilename);
                console.log(`File will be saved as: ${uniqueFilename}`);

                // Ghi file vào ổ đĩa
                try {
                    await writeFile(filePath, new Uint8Array(bytes));
                    console.log('File written to disk successfully');
                } catch (writeError) {
                    console.error('Error writing file:', writeError);
                    continue;
                }

                // Lấy thông tin metadata từ file đã lưu
                let metadata;
                try {
                    metadata = await getImageMetadata(filePath);
                    console.log('Image metadata retrieved:', metadata);
                } catch (metadataError) {
                    console.error('Error getting metadata:', metadataError);
                    metadata = { width: 0, height: 0 };
                }

                // Tạo record trong database
                try {
                    const photo = await prisma.photo.create({
                        data: {
                            originalName: file.name,
                            size: file.size,
                            width: metadata.width,
                            height: metadata.height,
                            url: `/uploads/${uniqueFilename}`,
                        },
                    });
                    console.log('Database record created:', photo);
                    savedPhotos.push(photo);
                } catch (dbError) {
                    console.error('Database error:', dbError);
                    continue;
                }
            } catch (error) {
                console.error('Error processing file:', error);
                continue;
            }
        }
        
        if (savedPhotos.length === 0) {
            return new NextResponse(
                JSON.stringify({ error: 'Không có file ảnh hợp lệ nào được upload' }), 
                { 
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );
        }

        return new NextResponse(
            JSON.stringify({
                message: 'Upload thành công!',
                photos: savedPhotos,
            }), 
            { 
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        );

    } catch (error: any) {
        console.error('Upload error:', error);
        let errorMessage = 'Lỗi server khi upload';
        if (error.message) {
            errorMessage += ': ' + error.message;
        }
        if (error.code) {
            errorMessage += ` (Code: ${error.code})`;
        }
        return new NextResponse(
            JSON.stringify({ error: errorMessage }), 
            { 
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        );
    }
}