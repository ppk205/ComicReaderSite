import { NextRequest, NextResponse } from 'next/server';

// Helper function to get auth token from request
function getAuthToken(request: NextRequest): string | null {
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }
    return null;
}

// Follow a user
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authToken = getAuthToken(request);

        if (!authToken) {
            return NextResponse.json(
                { success: false, message: 'Not authenticated' },
                { status: 401 }
            );
        }

        const userId = params.id;

        // Call backend API to follow user
        const backendUrl = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080/Comic/api';
        const response = await fetch(`${backendUrl}/users/${userId}/follow`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const data = await response.json();
            return NextResponse.json({
                success: true,
                message: 'Followed successfully',
                data
            });
        }

        return NextResponse.json(
            { success: false, message: 'Failed to follow user' },
            { status: response.status }
        );
    } catch (error) {
        console.error('Follow error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Unfollow a user
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authToken = getAuthToken(request);

        if (!authToken) {
            return NextResponse.json(
                { success: false, message: 'Not authenticated' },
                { status: 401 }
            );
        }

        const userId = params.id;

        // Call backend API to unfollow user
        const backendUrl = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080/Comic/api';
        const response = await fetch(`${backendUrl}/users/${userId}/follow`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const data = await response.json();
            return NextResponse.json({
                success: true,
                message: 'Unfollowed successfully',
                data
            });
        }

        return NextResponse.json(
            { success: false, message: 'Failed to unfollow user' },
            { status: response.status }
        );
    } catch (error) {
        console.error('Unfollow error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}

