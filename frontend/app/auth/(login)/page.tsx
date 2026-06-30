'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // TODO: replace with your actual auth logic
        await new Promise((r) => setTimeout(r, 1500));
        setLoading(false);
    };

    return (
        <div className="flex min-h-screen w-full">

            {/* ── Left Panel ── */}
            <div
                className="relative hidden w-[46%] flex-col justify-between overflow-hidden p-10 lg:flex"
                style={{
                    background: 'linear-gradient(160deg, #0f0c29 0%, #1a1a6e 45%, #3730a3 80%, #4f46e5 100%)',
                }}
            >
                {/* Grid overlay */}
                <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                        backgroundImage:
                            'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
                        backgroundSize: '40px 40px',
                    }}
                />

                {/* Glow */}
                <div
                    className="pointer-events-none absolute bottom-0 left-0 h-96 w-96 rounded-full blur-3xl"
                    style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.4) 0%, transparent 70%)' }}
                />
                <div
                    className="pointer-events-none absolute right-0 top-1/3 h-64 w-64 rounded-full blur-3xl"
                    style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.3) 0%, transparent 70%)' }}
                />

                {/* Logo */}
                <Link href="/" className="relative z-10 flex items-center gap-3 text-left">
                    <div className="relative flex items-center gap-3">
                        <div
                            className="flex h-10 w-10 items-center justify-center rounded-xl"
                            style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}
                        >
                            <svg width="20" height="20" fill="none" stroke="white" strokeWidth="1.8" viewBox="0 0 24 24">
                                <rect x="2" y="4" width="20" height="16" rx="2" />
                                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                            </svg>
                        </div>
                        <span className="text-base font-bold text-white">UoK MailAI</span>
                    </div>
                </Link>

                {/* Center content */}
                <div className="relative space-y-8">
                    <div className="space-y-4">
                        <h1 className="text-3xl font-extrabold leading-snug text-white xl:text-4xl">
                            AI-Powered Email Management for University of Kigali
                        </h1>
                        <p className="text-sm leading-relaxed text-blue-200">
                            Intelligent automation built on BERT &amp; T5 transformers to classify
                            and respond to institutional emails with precision.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <p className="relative text-xs text-blue-300/70">
                    University of Kigali &middot; AI Research Project &middot; 2025
                </p>
            </div>

            {/* ── Right Panel ── */}
            <div
                className="flex flex-1 flex-col items-center justify-center px-6 py-16"
                style={{ background: '#f5f6fa' }}
            >
                {/* Mobile logo */}
                <div className="mb-8 flex items-center gap-2 lg:hidden">
                    <div
                        className="flex h-9 w-9 items-center justify-center rounded-xl"
                        style={{ background: '#4f46e5' }}
                    >
                        <svg width="18" height="18" fill="none" stroke="white" strokeWidth="1.8" viewBox="0 0 24 24">
                            <rect x="2" y="4" width="20" height="16" rx="2" />
                            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                        </svg>
                    </div>
                    <span className="text-base font-bold text-gray-900">UoK MailAI</span>
                </div>

                <div className="w-full max-w-md">
                    {/* Heading */}
                    <div className="mb-8">
                        <h2 className="text-3xl font-extrabold text-gray-900">Welcome back</h2>
                        <p className="mt-1.5 text-sm text-gray-500">
                            Sign in to your role-based dashboard
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Email */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500">
                                Institutional Email
                            </label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                                    <svg width="16" height="16" fill="none" stroke="#9ca3af" strokeWidth="1.8" viewBox="0 0 24 24">
                                        <rect x="2" y="4" width="20" height="16" rx="2" />
                                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                    </svg>
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@uok.ac.rw"
                                    className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-11 pr-4 text-sm text-gray-800 placeholder-gray-400 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500">
                                    Password
                                </label>
                                <Link
                                    href="/auth/forgot-password"
                                    className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                                    <svg width="16" height="16" fill="none" stroke="#9ca3af" strokeWidth="1.8" viewBox="0 0 24 24">
                                        <rect x="3" y="11" width="18" height="11" rx="2" />
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeLinecap="round" />
                                    </svg>
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-11 pr-12 text-sm text-gray-800 placeholder-gray-400 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-gray-600"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? (
                                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" strokeLinecap="round" />
                                            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" strokeLinecap="round" />
                                            <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" />
                                        </svg>
                                    ) : (
                                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Remember me */}
                        <div className="flex items-center gap-2.5">
                            <input
                                id="remember"
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300 accent-indigo-600"
                            />
                            <label htmlFor="remember" className="text-sm text-gray-600">
                                Remember me for 30 days
                            </label>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-70"
                            style={{
                                background: loading
                                    ? '#6366f1'
                                    : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                                boxShadow: '0 8px 24px rgba(79,70,229,0.35)',
                            }}
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin" width="16" height="16" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                                        <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
                                    </svg>
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                                        <rect x="3" y="11" width="18" height="11" rx="2" />
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeLinecap="round" />
                                    </svg>
                                    Sign In Securely
                                </>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="my-6 flex items-center gap-4">
                        <div className="h-px flex-1 bg-gray-200" />
                        <span className="text-xs text-gray-400">or</span>
                        <div className="h-px flex-1 bg-gray-200" />
                    </div>

                    {/* SSO Button */}
                    <button
                        type="button"
                        className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-gray-200 bg-white py-3.5 text-sm font-semibold text-gray-700 shadow-sm transition-all duration-150 hover:border-gray-300 hover:shadow-md"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="#e8f0fe" />
                            <path d="M17.6 12.2c0-.4-.04-.8-.1-1.2H12v2.3h3.1c-.13.7-.53 1.3-1.13 1.7v1.4h1.83c1.07-1 1.8-2.47 1.8-4.2z" fill="#4285f4" />
                            <path d="M12 18c1.55 0 2.85-.52 3.8-1.4l-1.83-1.4c-.52.35-1.18.55-1.97.55-1.52 0-2.8-1.02-3.26-2.4H6.86v1.45C7.8 16.83 9.77 18 12 18z" fill="#34a853" />
                            <path d="M8.74 13.35A3.48 3.48 0 0 1 8.56 12c0-.47.08-.92.18-1.35V9.2H6.86A6.01 6.01 0 0 0 6 12c0 .97.23 1.88.86 2.8l1.88-1.45z" fill="#fbbc05" />
                            <path d="M12 8.25c.86 0 1.63.3 2.23.88l1.67-1.67C14.85 6.53 13.55 6 12 6 9.77 6 7.8 7.17 6.86 9.2l1.88 1.45C9.2 9.27 10.48 8.25 12 8.25z" fill="#ea4335" />
                        </svg>
                        Continue with Google Workspace
                    </button>

                    {/* Register link */}
                    <p className="mt-6 text-center text-sm text-gray-500">
                        No account yet?{' '}
                        <Link href="/auth/signup" className="font-bold text-indigo-600 hover:text-indigo-700">
                            Create one here
                        </Link>
                    </p>

                    {/* Back link */}
                    <div className="mt-4 flex justify-center">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600"
                        >
                            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Back to landing page
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
