'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Login() {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // login will accept an object { email, password }
            await login(credentials);
            router.push('/');
        } catch (err) {
            setError('Invalid email or password');
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
                        Sign in to your account
                    </p>
                </div>
                <form
                    className="mt-8 space-y-6 p-8 rounded-lg shadow-lg"
                    onSubmit={handleSubmit}
                    style={{ background: '#0f1724', boxShadow: '0 10px 30px rgba(2,6,23,0.7)', border: '1px solid rgba(255,255,255,0.02)' }}
                >
                    {error && (
                        <div className="px-4 py-3 rounded" style={{ background: '#3b1214', color: '#ffdede' }}>
                            {error}
                        </div>
                    )}

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium" style={{ color: '#E9D5FF' }}>
                            Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            className="mt-1 block w-full px-3 py-2 rounded-md focus:outline-none"
                            placeholder="you@example.com"
                            value={credentials.email}
                            onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                            style={{
                                background: '#071025',
                                border: '1px solid #2b2f3a',
                                color: '#E6EEF6',
                                placeholderColor: '#9aa0b2'
                            }}
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
                            className="mt-1 block w-full px-3 py-2 rounded-md focus:outline-none"
                            placeholder="Enter your password"
                            value={credentials.password}
                            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                            style={{
                                background: '#071025',
                                border: '1px solid #2b2f3a',
                                color: '#E6EEF6',
                                placeholderColor: '#9aa0b2'
                            }}
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
                            {isLoading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </div>

                    <div className="text-center mt-2">
                        <a href="/forgot-password" style={{ color: '#A78BFA' }} className="hover:opacity-90 text-sm">
                            Forgot your password?
                        </a>
                    </div>

                    <div className="text-center mt-4">
                        <a href="/register" style={{ color: '#D8B4FE' }} className="hover:opacity-90 text-sm">
                            Don't have an account? Register
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
}
