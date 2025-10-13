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
}

// Helper function to get user from session
function getUserFromSession(request: NextRequest) {
    const sessionCookie = request.cookies.get('session');
    const userCookie = request.cookies.get('user');

    if (!sessionCookie || !userCookie) {
        return null;
    }

    try {
        const userData = JSON.parse(userCookie.value);
        return userData;
    } catch {
        return null;
    }
}

export async function GET(request: NextRequest) {
    try {
        const user = getUserFromSession(request);

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'Not authenticated' },
                { status: 401 }
            );
        }

        // Call backend API to get full profile
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';
        const response = await fetch(`${backendUrl}/api/user/`, {
            method: 'GET',
            headers: {
                'Cookie': request.headers.get('cookie') || '',
            },
        });

        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                const profile = {
                    id: data.user.id,
                    username: data.user.username,
                    email: data.user.email,
                    status: data.user.status || 'active',
                    createdAt: data.user.createdAt,
                    updatedAt: data.user.updatedAt,
                    lastLogin: data.user.lastLogin,
                    roleId: data.user.roleId,
                    isOwnProfile: true
                };

                return NextResponse.json({
                    success: true,
                    user: profile
                });
            }
        }

        return NextResponse.json(
            { success: false, message: 'Failed to fetch profile' },
            { status: 404 }
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
        const user = getUserFromSession(request);

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'Not authenticated' },
                { status: 401 }
            );
        }

        const body = await request.json();

        // Call backend API to update profile
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';
        const response = await fetch(`${backendUrl}/api/user/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': request.headers.get('cookie') || '',
            },
            body: JSON.stringify(body),
        });

        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                return NextResponse.json({
                    success: true,
                    message: 'Profile updated successfully',
                    user: data.user
                });
            }
        }

        return NextResponse.json(
            { success: false, message: 'Failed to update profile' },
            { status: 400 }
        );
    } catch (error) {
        console.error('Profile PUT error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
