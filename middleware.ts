import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    // Kiểm tra xem có phải OPTIONS request không
    if (request.method === 'OPTIONS') {
        return new NextResponse(null, {
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length',
                'Access-Control-Max-Age': '86400',
            },
        })
    }

    // Xử lý các request khác
    const response = NextResponse.next()

    // Thêm CORS headers cho tất cả responses
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length')

    return response
}

export const config = {
    matcher: '/api/:path*',
}
