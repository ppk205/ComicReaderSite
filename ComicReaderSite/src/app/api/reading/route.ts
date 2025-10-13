import { NextRequest, NextResponse } from 'next/server';

interface ReadingHistory {
    id: string;
    userId: string;
    comicId: string;
    comicTitle: string;
    comicCover: string;
    lastChapter: number;
    totalChapters: number;
    isCompleted: boolean;
    status: 'reading' | 'completed' | 'plan_to_read' | 'dropped';
    lastReadTime: string;
    progress: number;
}

// Mock reading history data - replace with actual database
const readingHistories = new Map<string, ReadingHistory[]>();

// Initialize with some sample data
readingHistories.set('1', [
    {
        id: 'rh_1',
        userId: '1',
        comicId: 'comic_1',
        comicTitle: 'One Piece',
        comicCover: 'https://via.placeholder.com/150x200/4299e1/ffffff?text=One+Piece',
        lastChapter: 1100,
        totalChapters: 1100,
        isCompleted: true,
        status: 'completed',
        lastReadTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        progress: 100
    },
    {
        id: 'rh_2',
        userId: '1',
        comicId: 'comic_2',
        comicTitle: 'Naruto',
        comicCover: 'https://via.placeholder.com/150x200/f59e0b/ffffff?text=Naruto',
        lastChapter: 25,
        totalChapters: 72,
        isCompleted: false,
        status: 'reading',
        lastReadTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        progress: 34.7
    },
    {
        id: 'rh_3',
        userId: '1',
        comicId: 'comic_3',
        comicTitle: 'Attack on Titan',
        comicCover: 'https://via.placeholder.com/150x200/8b5cf6/ffffff?text=AOT',
        lastChapter: 139,
        totalChapters: 139,
        isCompleted: true,
        status: 'completed',
        lastReadTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        progress: 100
    },
    {
        id: 'rh_4',
        userId: '1',
        comicId: 'comic_4',
        comicTitle: 'Demon Slayer',
        comicCover: 'https://via.placeholder.com/150x200/10b981/ffffff?text=Demon+Slayer',
        lastChapter: 15,
        totalChapters: 23,
        isCompleted: false,
        status: 'reading',
        lastReadTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        progress: 65.2
    }
]);

function getUserFromSession(request: NextRequest) {
    const sessionCookie = request.cookies.get('session');
    const userCookie = request.cookies.get('user');

    if (sessionCookie?.value === 'valid' && userCookie?.value) {
        try {
            return JSON.parse(userCookie.value);
        } catch {
            return null;
        }
    }
    return null;
}

export async function GET(request: NextRequest) {
    const user = getUserFromSession(request);

    if (!user) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = searchParams.get('limit');

    try {
        let userHistory = readingHistories.get(user.id) || [];

        // Filter by status if provided
        if (status) {
            userHistory = userHistory.filter(history => history.status === status);
        }

        // Sort by last read time (most recent first)
        userHistory.sort((a, b) => new Date(b.lastReadTime).getTime() - new Date(a.lastReadTime).getTime());

        // Limit results if specified
        if (limit) {
            const limitNum = parseInt(limit);
            userHistory = userHistory.slice(0, limitNum);
        }

        return NextResponse.json({
            success: true,
            data: userHistory
        });
    } catch (error) {
        console.error('Error fetching reading history:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    const user = getUserFromSession(request);

    if (!user) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { comicId, comicTitle, comicCover, chapter, totalChapters } = body;

        if (!comicId || !comicTitle || chapter === undefined) {
            return NextResponse.json(
                { success: false, message: 'Missing required fields' },
                { status: 400 }
            );
        }

        let userHistory = readingHistories.get(user.id) || [];

        // Find existing entry
        let existingIndex = userHistory.findIndex(h => h.comicId === comicId);

        const progress = totalChapters > 0 ? (chapter / totalChapters) * 100 : 0;
        const isCompleted = totalChapters > 0 && chapter >= totalChapters;

        if (existingIndex >= 0) {
            // Update existing entry
            userHistory[existingIndex] = {
                ...userHistory[existingIndex],
                lastChapter: chapter,
                totalChapters: totalChapters || userHistory[existingIndex].totalChapters,
                progress,
                isCompleted,
                status: isCompleted ? 'completed' : 'reading',
                lastReadTime: new Date().toISOString()
            };
        } else {
            // Create new entry
            const newHistory: ReadingHistory = {
                id: `rh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                userId: user.id,
                comicId,
                comicTitle,
                comicCover: comicCover || '',
                lastChapter: chapter,
                totalChapters: totalChapters || 0,
                progress,
                isCompleted,
                status: isCompleted ? 'completed' : 'reading',
                lastReadTime: new Date().toISOString()
            };
            userHistory.push(newHistory);
        }

        readingHistories.set(user.id, userHistory);

        return NextResponse.json({
            success: true,
            message: 'Reading progress updated',
            data: userHistory[existingIndex] || userHistory[userHistory.length - 1]
        });
    } catch (error) {
        console.error('Error updating reading progress:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    const user = getUserFromSession(request);

    if (!user) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { comicId, status } = body;

        if (!comicId || !status) {
            return NextResponse.json(
                { success: false, message: 'Missing required fields' },
                { status: 400 }
            );
        }

        let userHistory = readingHistories.get(user.id) || [];
        const existingIndex = userHistory.findIndex(h => h.comicId === comicId);

        if (existingIndex >= 0) {
            userHistory[existingIndex].status = status as any;
            if (status === 'completed') {
                userHistory[existingIndex].isCompleted = true;
                userHistory[existingIndex].progress = 100;
            }

            readingHistories.set(user.id, userHistory);

            return NextResponse.json({
                success: true,
                message: 'Status updated',
                data: userHistory[existingIndex]
            });
        } else {
            return NextResponse.json(
                { success: false, message: 'Comic not found in reading history' },
                { status: 404 }
            );
        }
    } catch (error) {
        console.error('Error updating status:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
