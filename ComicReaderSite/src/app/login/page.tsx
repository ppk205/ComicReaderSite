'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
                credentials: 'include',
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Redirect to home page (trang chu) on successful login
                router.push('/');
                router.refresh(); // Refresh to update header
            } else {
                setError(data.message || 'Login failed. Please check your credentials.');
            }
        } catch (error) {
            console.error('Login error:', error);
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">Comic Reader</h1>
                    <p className="text-gray-400">Sign in to continue</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-lg mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="username" className="block text-gray-300 mb-2 font-medium">
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition"
                            placeholder="Enter your username"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-gray-300 mb-2 font-medium">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition"
                            placeholder="Enter your password"
                            required
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white font-bold py-3 px-4 rounded-lg hover:from-teal-600 hover:to-teal-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="mt-6 text-center text-gray-400 text-sm">
                    <p>Demo Accounts:</p>
                    <p className="text-teal-400 mt-1">Admin: <span className="font-mono">admin / admin123</span></p>
                    <p className="text-teal-400">Author: <span className="font-mono">the_lemonking / password123</span></p>
                    <p className="text-teal-400">User: <span className="font-mono">demo / demo123</span></p>
                </div>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => router.push('/')}
                        className="text-gray-400 hover:text-white transition text-sm"
                    >
                        ← Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
}