'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import apiService from '@/services/api';

export default function Register() {
    const [payload, setPayload] = useState({ username: '', email: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // ✅ Kiểm tra mật khẩu trùng khớp trước khi gửi
        if (payload.password !== payload.confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        try {
            await apiService.register(payload.username, payload.email, payload.password);
            await login({ username: payload.email, password: payload.password });
            router.push('/');
        } catch (err: any) {
            setError(err?.message || 'Registration failed');
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
                        Create an account
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
                        <label htmlFor="username" className="block text-sm font-medium text-[#E9D5FF]">
                            Username
                        </label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            required
                            className="mt-1 block w-full rounded-md border border-[#2b2f3a] bg-[#071025] px-3 py-2 text-[#E6EEF6] placeholder:text-[#9aa0b2] focus:outline-none"
                            placeholder="Choose a username"
                            value={payload.username}
                            onChange={(e) => setPayload({ ...payload, username: e.target.value })}
                        />
                    </div>

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
                            value={payload.email}
                            onChange={(e) => setPayload({ ...payload, email: e.target.value })}
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
                            placeholder="Choose a password"
                            value={payload.password}
                            onChange={(e) => setPayload({ ...payload, password: e.target.value })}
                        />
                    </div>

                    {/* ✅ Thêm Confirm Password */}
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#E9D5FF]">
                            Confirm Password
                        </label>
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            required
                            className="mt-1 block w-full rounded-md border border-[#2b2f3a] bg-[#071025] px-3 py-2 text-[#E6EEF6] placeholder:text-[#9aa0b2] focus:outline-none"
                            placeholder="Re-enter your password"
                            value={payload.confirmPassword}
                            onChange={(e) => setPayload({ ...payload, confirmPassword: e.target.value })}
                        />
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative flex w-full justify-center rounded-md border-none bg-gradient-to-r from-[#7C3AED] to-[#D946EF] py-2 px-4 text-sm font-medium text-white shadow-[0_6px_20px_rgba(124,58,237,0.25)] disabled:opacity-50"
                        >
                            {isLoading ? 'Creating account...' : 'Create account'}
                        </button>
                    </div>

                    <div className="mt-4 text-center">
                        <a href="/login" className="text-sm text-[#D8B4FE] hover:opacity-90">
                            Already have an account? Sign in
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
}
