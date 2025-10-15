'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        try {
            const formData = new URLSearchParams();
            formData.append('email', email);

            const res = await fetch('https://backend-comicreadersite.wonderfulbay-fb92c756.eastasia.azurecontainerapps.ioapi/auth/forgot-password', {
                method: 'POST',
                headers: {'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData.toString(),
            });

            const data = await res.json();
            setMessage(data.message || data.error || 'An unexpected error occurred');
        } catch {
            setMessage('Failed to send request. Please try again.');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#0b0b1a]">
            <div className="w-full max-w-md rounded-2xl bg-[#111224] p-8 shadow-lg">
                <h2 className="mb-2 text-center text-3xl font-bold text-white">Forgot Password</h2>
                <p className="mb-6 text-center text-gray-400 text-sm">
                    Enter your email and we&apos;ll send you a reset link
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-gray-300">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="mt-1 w-full rounded-lg border border-gray-700 bg-[#1a1b2e] p-3 text-gray-200 placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                            placeholder="you@example.com"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 py-3 text-white font-semibold hover:opacity-90 transition"
                    >
                        Send Reset Link
                    </button>
                </form>

                {message && <p className="mt-4 text-center text-sm text-gray-300">{message}</p>}

                <p className="mt-6 text-center text-sm text-gray-400">
                    Remember your password?{' '}
                    <a href="/login" className="text-purple-400 hover:underline">
                        Sign in
                    </a>
                </p>
            </div>
        </div>
    );
}
