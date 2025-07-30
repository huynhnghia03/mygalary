import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const maxDuration = 300;

import { prisma } from '@/lib/prisma';
import { getImageMetadata } from '@/lib/imageProcessor';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { uploadToCloudinary } from '@/lib/cloudinary';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Credentials': 'true',
};

// Helper function để tạo response với CORS headers
const createJsonResponse = (data: any, status: number = 200) => {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
        },
    });
};

// Handler cho OPTIONS request
export async function OPTIONS() {
    return new Response(null, {
        status: 200,
        headers: corsHeaders
    });
};

export async function POST(req: NextRequest) {
    // Handle preflight request
    if (req.method === 'OPTIONS') {
        return new Response(null, {
            status: 200,
            headers: corsHeaders
        });
    }

    // Chỉ chấp nhận POST request
    if (req.method !== 'POST') {
        return new Response(
            JSON.stringify({ error: 'Method not allowed' }), 
            { 
                status: 405,
                headers: {
                    'Content-Type': 'application/json',
                    ...corsHeaders
                }
            }
        );
    }

    try {
        console.log('Starting file upload process...');

        const formData = await req.formData();
        const files = formData.getAll('photos') as File[];

        if (files.length === 0) {
            return createJsonResponse({ error: 'Không có file nào được upload' }, 400);
        }

        console.log(`Processing ${files.length} files...`);

        const savedPhotos = [];

        for (const file of files) {
            // Bỏ qua nếu không phải file ảnh
            if (!file.type.startsWith('image/')) {
                console.warn(`Đã bỏ qua file không phải ảnh: ${file.name}`);
                continue;
            }

            try {
                console.log(`Processing file: ${file.name}`);
                
                // Chuyển file thành Buffer
                const buffer = Buffer.from(await file.arrayBuffer());
                console.log('File converted to Buffer');
                
                // Tạo tên file duy nhất
                const uniqueFilename = `${uuidv4()}${path.extname(file.name)}`;
                console.log(`File will be saved as: ${uniqueFilename}`);

                // Upload file lên Cloudinary
                let fileUrl;
                try {
                    fileUrl = await uploadToCloudinary(buffer, uniqueFilename, file.type);
                    console.log('File uploaded to Cloudinary successfully:', fileUrl);
                } catch (uploadError) {
                    console.error('Error uploading to Cloudinary:', uploadError);
                    continue;
                }

                // Lấy thông tin metadata từ buffer
                let metadata;
                try {
                    metadata = await getImageMetadata(buffer);
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
                            url: fileUrl,
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
            return createJsonResponse({ error: 'Không có file ảnh hợp lệ nào được upload' }, 400);
        }

        return createJsonResponse({
            message: 'Upload thành công!',
            photos: savedPhotos
        });

    } catch (error: any) {
        console.error('Upload error:', error);
        let errorMessage = 'Lỗi server khi upload';
        if (error.message) {
            errorMessage += ': ' + error.message;
        }
        if (error.code) {
            errorMessage += ` (Code: ${error.code})`;
        }
        return createJsonResponse({ error: errorMessage }, 500);
    }
}