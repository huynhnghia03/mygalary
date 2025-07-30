import { NextResponse } from 'next/server';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length',
};

export async function GET() {
    return new NextResponse(
        JSON.stringify({ message: 'Please use POST method to upload photos' }), 
        { 
            status: 405,
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json',
            }
        }
    );
}

export async function PUT() {
    return new NextResponse(
        JSON.stringify({ message: 'Method not allowed' }), 
        { 
            status: 405,
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json',
            }
        }
    );
}

export async function DELETE() {
    return new NextResponse(
        JSON.stringify({ message: 'Method not allowed' }), 
        { 
            status: 405,
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json',
            }
        }
    );
}

export async function HEAD() {
    return new NextResponse(null, { 
        status: 405,
        headers: corsHeaders
    });
}
