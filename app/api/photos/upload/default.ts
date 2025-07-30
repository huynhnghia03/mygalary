import { NextRequest } from 'next/server';
import { POST } from './route';

// Handler chung cho tất cả các requests
export async function handler(req: NextRequest) {
    // Nếu là OPTIONS request
    if (req.method === 'OPTIONS') {
        return new Response(null, {
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Credentials': 'true',
            },
        });
    }

    // Nếu là POST request
    if (req.method === 'POST') {
        return POST(req);
    }

    // Các methods khác
    return new Response(null, { status: 405 });
}
