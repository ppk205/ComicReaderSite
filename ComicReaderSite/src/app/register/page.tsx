'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api'; // adjust path if your api.ts is located elsewhere

export default function Register() {
    const [payload, setPayload] = useState({ username: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // Use the apiService.register method (same style as login)
            await apiService.register(payload.username, payload.email, payload.password);

            // After successful registration, log in with email/password
            await login({ email: payload.email, password: payload.password });
            router.push('/');
        } catch (err: any) {
            setError(err?.message || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg,#070615 0%,#05040a 100%)' }}>
            <div className="max-w-md w-full space-y-8 px-4">
                <div className="text-center">
                    <h2 className="mt-6 text-center text-3xl font-extrabold" style={{ color: '#E9D5FF' }}>
                        Comic Reader
                    </h2>
                    <p className="mt-2 text-center text-sm" style={{ color: '#BDB6CC' }}>
                        Create an account
                    </p>
                </div>
                <form className="mt-8 space-y-6 p-8 rounded-lg shadow-lg" onSubmit={handleSubmit}
                      style={{ background: '#0f1724', boxShadow: '0 10px 30px rgba(2,6,23,0.7)', border: '1px solid rgba(255,255,255,0.02)' }}>
                    {error && (
                        <div className="px-4 py-3 rounded" style={{ background: '#3b1214', color: '#ffdede' }}>
                            {error}
                        </div>
                    )}

                    <div>
                        <label htmlFor="username" className="block text-sm font-medium" style={{ color: '#E9D5FF' }}>
                            Username
                        </label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            required
                            className="mt-1 relative block w-full px-3 py-2 rounded-md focus:outline-none"
                            placeholder="Choose a username"
                            value={payload.username}
                            onChange={(e) => setPayload({ ...payload, username: e.target.value })}
                            style={{ background: '#071025', border: '1px solid #2b2f3a', color: '#E6EEF6' }}
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium" style={{ color: '#E9D5FF' }}>
                            Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            className="mt-1 relative block w-full px-3 py-2 rounded-md focus:outline-none"
                            placeholder="you@example.com"
                            value={payload.email}
                            onChange={(e) => setPayload({ ...payload, email: e.target.value })}
                            style={{ background: '#071025', border: '1px solid #2b2f3a', color: '#E6EEF6' }}
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium" style={{ color: '#E9D5FF' }}>
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            className="mt-1 relative block w-full px-3 py-2 rounded-md focus:outline-none"
                            placeholder="Choose a password"
                            value={payload.password}
                            onChange={(e) => setPayload({ ...payload, password: e.target.value })}
                            style={{ background: '#071025', border: '1px solid #2b2f3a', color: '#E6EEF6' }}
                        />
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-2 px-4 text-sm font-medium rounded-md disabled:opacity-50"
                            style={{
                                color: '#fff',
                                background: 'linear-gradient(90deg,#7C3AED 0%,#D946EF 100%)',
                                border: 'none',
                                boxShadow: '0 6px 20px rgba(124,58,237,0.25)'
                            }}
                        >
                            {isLoading ? 'Creating account...' : 'Create account'}
                        </button>
                    </div>

                    <div className="text-center mt-4">
                        <a href="/login" style={{ color: '#D8B4FE' }} className="hover:opacity-90 text-sm">
                            Already have an account? Sign in
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
}