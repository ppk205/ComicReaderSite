export interface User {
    id: string;
    username: string;
    email: string;
    role: UserRole;
    status: 'active' | 'inactive' | 'suspended';
    createdAt: string;
    updatedAt: string;
    lastLogin?: string;
}

export interface UserRole {
    id: string;
    name: 'admin' | 'moderator' | 'user';
    permissions: Permission[];
    description: string;
}

export interface Permission {
    id: string;
    name: string;
    resource: 'manga' | 'user' | 'role' | 'dashboard';
    action: 'create' | 'read' | 'update' | 'delete' | 'manage';
    description: string;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    permissions: Permission[];
}

// Allow either username or email as the identifier. Password required.
export interface LoginCredentials {
    username?: string;
    email?: string;
    password: string;
}

export interface CreateUserRequest {
    username: string;
    email: string;
    password: string;
    roleId: string;
}

export interface UpdateUserRequest {
    id: string;
    username?: string;
    email?: string;
    roleId?: string;
    status?: 'active' | 'inactive' | 'suspended';
}

// Helper functions for permission checking
export const hasPermission = (user: User | null, resource: string, action: string): boolean => {
    if (!user) return false;
    return user.role.permissions.some(p =>
        p.resource === resource && p.action === action
    );
};

export const isAdmin = (user: User | null): boolean => {
    return user?.role.name === 'admin';
};

export const isModerator = (user: User | null): boolean => {
    return user?.role.name === 'moderator';
};

export const canManageUsers = (user: User | null): boolean => {
    return hasPermission(user, 'user', 'manage') || isAdmin(user);
};

export const canManageManga = (user: User | null): boolean => {
    return hasPermission(user, 'manga', 'manage') || hasPermission(user, 'manga', 'create');
};