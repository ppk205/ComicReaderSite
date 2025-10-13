import { NextRequest, NextResponse } from 'next/server';

interface UserData {
    id: string;
    username: string;
    email: string;
    status: string;
    createdAt?: string;
    updatedAt?: string;
    lastLogin?: string;
    roleId?: string;
    role?: {
        id: string;
        name: string;
        permissions: string[];
    };
}

// Helper function to get auth token from request
function getAuthToken(request: NextRequest): string | null {
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }
    return null;
}

export async function GET(request: NextRequest) {
    try {
        const authToken = getAuthToken(request);

        if (!authToken) {
            return NextResponse.json(
                { success: false, message: 'Not authenticated' },
                { status: 401 }
            );
        }

        // Call backend API to get current user profile
        const backendUrl = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080/Comic/api';
        const response = await fetch(`${backendUrl}/auth/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const userData = await response.json();

            const profile: UserData & { isOwnProfile: boolean; seriesCount: number; followersCount: number; viewersCount: number } = {
                id: userData.id,
                username: userData.username,
                email: userData.email,
                status: userData.status || 'active',
                createdAt: userData.createdAt,
                updatedAt: userData.updatedAt,
                lastLogin: userData.lastLogin,
                roleId: userData.role?.id,
                role: userData.role,
                isOwnProfile: true, // This is the current user's own profile
                seriesCount: userData.seriesCount || 0,
                followersCount: userData.followersCount || 0,
                viewersCount: userData.viewersCount || 0,
            };

            return NextResponse.json({
                success: true,
                user: profile
            });
        }

        return NextResponse.json(
            { success: false, message: 'Failed to fetch profile' },
            { status: response.status }
        );
    } catch (error) {
        console.error('Profile GET error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const authToken = getAuthToken(request);

        if (!authToken) {
            return NextResponse.json(
                { success: false, message: 'Not authenticated' },
                { status: 401 }
            );
        }

        const body = await request.json();

        // Get current user info first
        const backendUrl = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080/Comic/api';
        const currentUserResponse = await fetch(`${backendUrl}/auth/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (!currentUserResponse.ok) {
            return NextResponse.json(
                { success: false, message: 'Not authenticated' },
                { status: 401 }
            );
        }

        const currentUser = await currentUserResponse.json();

        // Call backend API to update profile
        const updateResponse = await fetch(`${backendUrl}/users/${currentUser.id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: body.username,
                email: body.email,
                status: body.status,
                roleId: currentUser.role?.id, // Keep existing role
            }),
        });

        if (updateResponse.ok) {
            const updatedUser = await updateResponse.json();
            return NextResponse.json({
                success: true,
                message: 'Profile updated successfully',
                user: updatedUser
            });
        }

        return NextResponse.json(
            { success: false, message: 'Failed to update profile' },
            { status: updateResponse.status }
        );
    } catch (error) {
        console.error('Profile PUT error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
