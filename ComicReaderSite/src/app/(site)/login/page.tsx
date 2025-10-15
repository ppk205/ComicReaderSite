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
            await login({ username: credentials.email, password: credentials.password });
            router.push('/');
        } catch (err) {
            setError('Invalid email or password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#070615] to-[#05040a]">
            <div className="w-full max-w-md space-y-8 px-4">
                <div className="text-center">
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-[#E9D5FF]">
                        Comic Reader
                    </h2>
                    <p className="mt-2 text-center text-sm text-[#BDB6CC]">
                        Sign in to your account
                    </p>
                </div>
                <form
                    className="mt-8 space-y-6 rounded-lg border border-white/5 bg-[#0f1724]/95 p-8 shadow-[0_10px_30px_rgba(2,6,23,0.7)]"
                    onSubmit={handleSubmit}
                >
                    {error && (
                        <div className="rounded bg-[#3b1214] px-4 py-3 text-[#ffdede]">
                            {error}
                        </div>
                    )}

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-[#E9D5FF]">
                            Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            className="mt-1 block w-full rounded-md border border-[#2b2f3a] bg-[#071025] px-3 py-2 text-[#E6EEF6] placeholder:text-[#9aa0b2] focus:outline-none"
                            placeholder="you@example.com"
                            value={credentials.email}
                            onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-[#E9D5FF]">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            className="mt-1 block w-full rounded-md border border-[#2b2f3a] bg-[#071025] px-3 py-2 text-[#E6EEF6] placeholder:text-[#9aa0b2] focus:outline-none"
                            placeholder="Enter your password"
                            value={credentials.password}
                            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                        />
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative flex w-full justify-center rounded-md bg-gradient-to-r from-[#7C3AED] to-[#D946EF] py-2 px-4 text-sm font-medium text-white shadow-[0_6px_20px_rgba(124,58,237,0.25)] disabled:opacity-50"
                        >
                            {isLoading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </div>

                    <div className="mt-2 text-center">
                        <a href="/forgot-password" className="text-sm text-[#A78BFA] hover:opacity-90">
                            Forgot your password?
                        </a>
                    </div>

                    <div className="mt-4 text-center">
                        <a href="/register" className="text-sm text-[#D8B4FE] hover:opacity-90">
                            Don't have an account? Register
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
}
