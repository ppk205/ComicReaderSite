import { NextRequest, NextResponse } from 'next/server';
import { getUserByUsername } from '../userStorage';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { username, password } = body;

        if (!username || !password) {
            return NextResponse.json(
                { success: false, message: 'Username and password are required' },
                { status: 400 }
            );
        }

        // Find user by username from shared storage
        const user = getUserByUsername(username);

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'Invalid username or password' },
                { status: 401 }
            );
        }

        // Check password (in production, use bcrypt.compare)
        if (user.password !== password) {
            return NextResponse.json(
                { success: false, message: 'Invalid username or password' },
                { status: 401 }
            );
        }

        // Create response with session cookie
        const response = NextResponse.json({
            success: true,
            message: 'Login successful',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                displayName: user.displayName,
                role: user.role
            }
        });

        // Set session cookie
        response.cookies.set('session', user.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/'
        });

        // Store user data in cookie for profile access (with all current data)
        response.cookies.set('user', JSON.stringify({
            id: user.id,
            username: user.username,
            email: user.email,
            displayName: user.displayName,
            role: user.role,
            bio: user.bio,
            seriesCount: user.seriesCount,
            followersCount: user.followersCount,
            viewerCount: user.viewerCount,
            avatarUrl: user.avatarUrl,
            socialLinks: user.socialLinks,
            quickNote: user.quickNote
        }), {
            httpOnly: false, // Make it accessible to client-side for profile page
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/'
        });

        return response;
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
