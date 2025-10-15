'use client';

import { Suspense, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function ResetPasswordInner() {
    const router = useRouter();
    const params = useSearchParams();
    const token = useMemo(() => params.get('token'), [params]);

    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirm) {
            setMessage("Passwords don't match");
            return;
        }

        try {
            const res = await fetch('http://localhost:8080/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });
            const data = await res.json();
            if (data.message) {
                setMessage(data.message);
                setTimeout(() => router.push('/login'), 2000);
            } else {
                setMessage(data.error || 'Failed to reset password');
            }
        } catch {
            setMessage('Network error. Please try again.');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#0b0b1a]">
            <div className="w-full max-w-md rounded-2xl bg-[#111224] p-8 shadow-lg">
                <h2 className="mb-2 text-center text-3xl font-bold text-white">Reset Password</h2>
                <p className="mb-6 text-center text-gray-400 text-sm">
                    Enter your new password below
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-gray-300">New Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="mt-1 w-full rounded-lg border border-gray-700 bg-[#1a1b2e] p-3 text-gray-200 placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                            placeholder="Enter new password"
                        />
                    </div>

                    <div>
                        <label className="text-gray-300">Confirm Password</label>
                        <input
                            type="password"
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            required
                            className="mt-1 w-full rounded-lg border border-gray-700 bg-[#1a1b2e] p-3 text-gray-200 placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                            placeholder="Re-enter new password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 py-3 text-white font-semibold hover:opacity-90 transition"
                    >
                        Reset Password
                    </button>
                </form>

                {message && <p className="mt-4 text-center text-sm text-gray-300">{message}</p>}

                <p className="mt-6 text-center text-sm text-gray-400">
                    Back to{' '}
                    <a href="/login" className="text-purple-400 hover:underline">
                        Sign in
                    </a>
                </p>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-screen items-center justify-center bg-[#0b0b1a] text-gray-200">
                    Loading reset form...
                </div>
            }
        >
            <ResetPasswordInner />
        </Suspense>
    );
}
