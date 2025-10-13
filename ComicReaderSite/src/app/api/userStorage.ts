// Shared user storage for mock database
// In production, this would be replaced with actual database calls

interface UserData {
    id: string;
    username: string;
    password: string;
    email: string;
    displayName: string;
    role: string;
    bio: string;
    seriesCount: number;
    followersCount: number;
    viewerCount: number;
    avatarUrl?: string;
    socialLinks: Record<string, string>;
    quickNote?: {
        content: string;
        expiresAt: string;
    };
}

// Initialize with default users
const defaultUsers: UserData[] = [
    {
        id: '1',
        username: 'admin',
        password: 'admin123',
        email: 'admin@comicrealizer.com',
        displayName: 'System Administrator',
        role: 'admin',
        bio: 'Site administrator with full access to manage content and users.',
        seriesCount: 0,
        followersCount: 0,
        viewerCount: 0,
        socialLinks: {}
    },
    {
        id: '2',
        username: 'the_lemonking',
        password: 'password123',
        email: 'lemonking@example.com',
        displayName: 'the_lemonking',
        role: 'author',
        bio: 'Hello :3\nI make comic about stupid snake',
        seriesCount: 1,
        followersCount: 86,
        viewerCount: 1247,
        socialLinks: {
            youtube: '',
            twitter: '',
            instagram: '',
            website: 'https://thelemonking.carrd.co/'
        }
    },
    {
        id: '3',
        username: 'manga_artist_ken',
        password: 'author123',
        email: 'ken@example.com',
        displayName: 'Ken Nakamura',
        role: 'author',
        bio: 'Professional manga artist with 10 years of experience. Love creating fantasy and adventure stories!',
        seriesCount: 3,
        followersCount: 542,
        viewerCount: 8932,
        socialLinks: {
            youtube: '',
            twitter: '@ken_manga',
            instagram: '',
            website: ''
        }
    },
    {
        id: '4',
        username: 'comic_master_yuki',
        password: 'author123',
        email: 'yuki@example.com',
        displayName: 'Yuki Tanaka',
        role: 'author',
        bio: 'Indie comic creator | Romance & Slice of Life enthusiast 💕',
        seriesCount: 2,
        followersCount: 234,
        viewerCount: 4521,
        socialLinks: {
            youtube: '',
            twitter: '@yuki_comics',
            instagram: 'yuki.comics',
            website: 'https://yukicomics.com'
        }
    },
    {
        id: '5',
        username: 'dark_pen_studio',
        password: 'author123',
        email: 'darkpen@example.com',
        displayName: 'Dark Pen Studio',
        role: 'author',
        bio: 'Creating dark fantasy and horror manga. Nightmares guaranteed! 🌙',
        seriesCount: 4,
        followersCount: 892,
        viewerCount: 15634,
        socialLinks: {
            youtube: 'youtube.com/darkpenstudio',
            twitter: '@darkpenstudio',
            instagram: '',
            website: ''
        }
    },
    {
        id: '6',
        username: 'demo',
        password: 'demo123',
        email: 'demo@example.com',
        displayName: 'Demo User',
        role: 'user',
        bio: 'This is a demo account for testing purposes.',
        seriesCount: 0,
        followersCount: 10,
        viewerCount: 0,
        socialLinks: {}
    },
    {
        id: '7',
        username: 'manga_lover_2024',
        password: 'user123',
        email: 'lover2024@example.com',
        displayName: 'MangaLover2024',
        role: 'user',
        bio: 'Passionate manga reader! Currently reading over 50 series 📚',
        seriesCount: 0,
        followersCount: 45,
        viewerCount: 0,
        socialLinks: {}
    },
    {
        id: '8',
        username: 'otaku_life',
        password: 'user123',
        email: 'otaku@example.com',
        displayName: 'OtakuLife',
        role: 'user',
        bio: 'Anime and manga are life! Always looking for new recommendations.',
        seriesCount: 0,
        followersCount: 78,
        viewerCount: 0,
        socialLinks: {}
    }
];

// In-memory storage (persists during server runtime)
const userStorage = new Map<string, UserData>();

// Initialize storage with default users
function initializeStorage() {
    if (userStorage.size === 0) {
        defaultUsers.forEach(user => {
            userStorage.set(user.id, { ...user });
        });
    }
}

// Get user by ID
export function getUserById(id: string): UserData | undefined {
    initializeStorage();
    return userStorage.get(id);
}

// Get user by username
export function getUserByUsername(username: string): UserData | undefined {
    initializeStorage();
    return Array.from(userStorage.values()).find(u => u.username === username);
}

// Update user
export function updateUser(id: string, updates: Partial<UserData>): UserData | undefined {
    initializeStorage();
    const user = userStorage.get(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...updates };
    userStorage.set(id, updatedUser);
    return updatedUser;
}

// Get all users
export function getAllUsers(): UserData[] {
    initializeStorage();
    return Array.from(userStorage.values());
}

