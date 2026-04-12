'use client';

import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { AuthState, LoginCredentials, User } from '@/types/auth';
import { apiService } from '@/services/api';

// [SECURITY FIX] Vuln #3: Removed DEFAULT_USERNAME / DEFAULT_PASSWORD constants
// and the automatic login behavior. Hardcoded credentials (even via env vars with
// NEXT_PUBLIC_ prefix) are visible in the client-side JS bundle and must not exist.

interface AuthContextType {
    state: AuthState;
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
    | { type: 'LOGIN_START' }
    | { type: 'LOGIN_SUCCESS'; payload: User }
    | { type: 'LOGIN_FAILURE' }
    | { type: 'LOGOUT' }
    | { type: 'REFRESH_USER'; payload: User };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
    switch (action.type) {
        case 'LOGIN_START':
            return { ...state, isLoading: true };
        case 'LOGIN_SUCCESS':
            return {
                ...state,
                user: action.payload,
                isAuthenticated: true,
                isLoading: false,
                permissions: action.payload.role.permissions,
            };
        case 'LOGIN_FAILURE':
            return {
                ...state,
                user: null,
                isAuthenticated: false,
                isLoading: false,
                permissions: [],
            };
        case 'LOGOUT':
            return {
                user: null,
                isAuthenticated: false,
                isLoading: false,
                permissions: [],
            };
        case 'REFRESH_USER':
            return {
                ...state,
                user: action.payload,
                permissions: action.payload.role.permissions,
            };
        default:
            return state;
    }
};

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    permissions: [],
};

function normaliseAuthResponse(response: any): { token: string; user: User } {
    const token = response?.token || response?.accessToken || response?.access_token;
    const user = response?.user || response;

    if (!token || !user) {
        throw new Error('Unexpected authentication response from backend');
    }

    return { token, user };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(authReducer, initialState);

    const login = async (credentials: LoginCredentials) => {
        dispatch({ type: 'LOGIN_START' });
        try {
            const response = await apiService.login(credentials);
            const { token, user } = normaliseAuthResponse(response);

            // [SECURITY NOTE] Vuln #11: Token stored in localStorage is accessible to XSS.
            // For higher security, consider httpOnly cookies. Kept as-is to avoid breaking
            // the existing auth flow, but XSS risk is mitigated by fixing Vuln #4 (allowScriptedContent=false).
            localStorage.setItem('authToken', token);
            localStorage.setItem('user', JSON.stringify(user));

            dispatch({ type: 'LOGIN_SUCCESS', payload: user });
        } catch (error) {
            dispatch({ type: 'LOGIN_FAILURE' });
            throw error;
        }
    };

    const logout = async () => {
        try {
            await apiService.logout();
        } catch (error) {
            console.warn('Logout request failed', error);
        }
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        dispatch({ type: 'LOGOUT' });
    };

    const refreshUser = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            return;
        }

        try {
            const user = await apiService.getCurrentUser();
            dispatch({ type: 'REFRESH_USER', payload: user as User });
        } catch (error) {
            console.error('Failed to refresh user session', error);
            await logout();
        }
    };

    useEffect(() => {
        const bootstrap = async () => {
            const token = localStorage.getItem('authToken');
            const storedUser = localStorage.getItem('user');

            if (token && storedUser) {
                const user = JSON.parse(storedUser);
                dispatch({ type: 'LOGIN_SUCCESS', payload: user });
                // Validate token is still valid with the backend
                await refreshUser();
            }
            // [SECURITY FIX] Vuln #3: No automatic login with default credentials.
            // Users must explicitly log in via the login form.
        };

        bootstrap();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <AuthContext.Provider value={{ state, login, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}