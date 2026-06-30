'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useRegisterMutation } from '@/lib/redux/silces/AuthSlice';

type Role = 'Admin' | 'Staff' | 'Reviewer' | '';

const departments = [
    'Registrar\'s Office',
    'Student Affairs',
    'Finance Department',
    'Faculty Admissions',
    'ICT Department',
    'Academic Affairs',
    'Human Resources',
    'Research & Innovation',
];

const roles: { id: Role; label: string; icon: React.ReactNode }[] = [
    {
        id: 'Admin',
        label: 'System Administrator',
        icon: (
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
    },
    {
        id: 'Staff',
        label: 'Email Staff',
        icon: (
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
        ),
    },
    {
        id: 'Reviewer',
        label: 'Human Reviewer',
        icon: (
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="9" cy="7" r="4" />
                <polyline points="16 11 18 13 22 9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
    },
];

export default function SignupPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role>('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [register] = useRegisterMutation();

    const getErrorMessage = (err: unknown) => {
        if (typeof err === 'object' && err && 'data' in err) {
            const payload = err as { data?: { error?: string } };
            return payload.data?.error;
        }
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        const form = new FormData(e.currentTarget as HTMLFormElement);
        const username = String(form.get('username') ?? '').trim();
        const email = String(form.get('email') ?? '').trim();
        const password = String(form.get('password') ?? '');
        const confirmPassword = String(form.get('confirm_password') ?? '');

        if (password !== confirmPassword) {
            setMessage('Passwords do not match.');
            setLoading(false);
            return;
        }

        try {
            await register({
                username,
                email,
                password,
                role: selectedRole || 'Staff',
                is_active: true,
            }).unwrap();
            router.push('/auth');
        } catch (err: unknown) {
            setMessage(getErrorMessage(err) || 'Unable to create account.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full">

            {/* ── Left Panel ── */}
            <div
                className="relative hidden w-[42%] flex-col justify-between overflow-hidden p-10 lg:flex"
                style={{
                    background: 'linear-gradient(160deg, #0f0c29 0%, #1a0533 35%, #2d1b69 65%, #4c1d95 100%)',
                }}
            >
                {/* Grid overlay */}
                <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                        backgroundImage:
                            'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
                        backgroundSize: '40px 40px',
                    }}
                />
                {/* Glow */}
                <div
                    className="pointer-events-none absolute bottom-10 left-0 h-80 w-80 rounded-full blur-3xl"
                    style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.45) 0%, transparent 70%)' }}
                />
                <div
                    className="pointer-events-none absolute right-0 top-20 h-56 w-56 rounded-full blur-3xl"
                    style={{ background: 'radial-gradient(circle, rgba(79,70,229,0.3) 0%, transparent 70%)' }}
                />

                {/* Logo */}
                <Link href="/" className="relative z-10 flex items-center gap-3 text-left">
                    <div className="relative flex items-center gap-3">
                        <div
                            className="flex h-10 w-10 items-center justify-center rounded-xl"
                            style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)' }}
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
                    <h1 className="text-2xl font-extrabold leading-snug text-white xl:text-3xl">
                        Join the UoK AI Email Research Evaluation
                    </h1>

                    {/* Participants table */}
                    <div
                        className="overflow-hidden rounded-2xl"
                        style={{
                            background: 'rgba(255,255,255,0.07)',
                            border: '1px solid rgba(255,255,255,0.12)',
                        }}
                    >
                    </div>
                </div>

                {/* Footer */}
                <p className="relative text-xs text-purple-300/60">
                    TAM-based Likert questionnaire &middot; 10 test emails per evaluator
                </p>
            </div>

            {/* ── Right Panel ── */}
            <div
                className="flex flex-1 flex-col items-center justify-center px-6 py-12"
                style={{ background: '#f5f6fa' }}
            >
                {/* Mobile logo */}
                <div className="mb-6 flex items-center gap-2 lg:hidden">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: '#4f46e5' }}>
                        <svg width="18" height="18" fill="none" stroke="white" strokeWidth="1.8" viewBox="0 0 24 24">
                            <rect x="2" y="4" width="20" height="16" rx="2" />
                            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                        </svg>
                    </div>
                    <span className="text-base font-bold text-gray-900">UoK MailAI</span>
                </div>

                <div className="w-full max-w-lg">
                    {/* Heading */}
                    <div className="mb-7">
                        <h2 className="text-3xl font-extrabold text-gray-900">Create your account</h2>
                        <p className="mt-1.5 text-sm text-gray-500">
                            Fill in your details to request system access
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {message && (
                            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                                {message}
                            </div>
                        )}

                        {/* Full Name */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500">
                                Full Name
                            </label>
                            <input
                                type="text"
                                required
                                name="username"
                                placeholder="Dr. Jean-Baptiste Uwimana"
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm text-gray-800 placeholder-gray-400 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                            />
                        </div>

                        {/* Email */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500">
                                Institutional Email
                            </label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                                    <svg width="15" height="15" fill="none" stroke="#9ca3af" strokeWidth="1.8" viewBox="0 0 24 24">
                                        <rect x="2" y="4" width="20" height="16" rx="2" />
                                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                    </svg>
                                </div>
                                <input
                                    type="email"
                                    required
                                    name="email"
                                    placeholder="j.uwimana@uok.ac.rw"
                                    className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-11 pr-4 text-sm text-gray-800 placeholder-gray-400 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                />
                            </div>
                        </div>

                        {/* Department */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500">
                                Department
                            </label>
                            <div className="relative">
                                <select
                                    required
                                    defaultValue=""
                                    className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm text-gray-800 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                >
                                    <option value="" disabled>Select department...</option>
                                    {departments.map((d) => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                                    <svg width="14" height="14" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24">
                                        <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Requested Role */}
                        <div className="space-y-2">
                            <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500">
                                Requested Role
                            </label>
                            <div className="grid grid-cols-2 gap-2.5">
                                {roles.map((role) => {
                                    const isSelected = selectedRole === role.id;
                                    return (
                                        <button
                                            key={role.id}
                                            type="button"
                                            onClick={() => setSelectedRole(role.id)}
                                            className="flex items-center gap-2.5 rounded-xl px-4 py-3 text-left text-sm font-medium transition-all duration-150"
                                            style={{
                                                background: isSelected ? 'rgba(79,70,229,0.08)' : '#ffffff',
                                                border: isSelected
                                                    ? '1.5px solid rgba(79,70,229,0.5)'
                                                    : '1.5px solid #e5e7eb',
                                                color: isSelected ? '#4f46e5' : '#6b7280',
                                            }}
                                        >
                                            <span style={{ color: isSelected ? '#4f46e5' : '#9ca3af' }}>
                                                {role.icon}
                                            </span>
                                            {role.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500">
                                Password
                            </label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                                    <svg width="15" height="15" fill="none" stroke="#9ca3af" strokeWidth="1.8" viewBox="0 0 24 24">
                                        <rect x="3" y="11" width="18" height="11" rx="2" />
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeLinecap="round" />
                                    </svg>
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    minLength={8}
                                    name="password"
                                    placeholder="Min. 8 characters"
                                    className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-11 pr-12 text-sm text-gray-800 placeholder-gray-400 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-gray-600"
                                    aria-label="Toggle password"
                                >
                                    {showPassword ? (
                                        <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" strokeLinecap="round" />
                                            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" strokeLinecap="round" />
                                            <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" />
                                        </svg>
                                    ) : (
                                        <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                                    <svg width="15" height="15" fill="none" stroke="#9ca3af" strokeWidth="1.8" viewBox="0 0 24 24">
                                        <rect x="3" y="11" width="18" height="11" rx="2" />
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeLinecap="round" />
                                    </svg>
                                </div>
                                <input
                                    type={showConfirm ? 'text' : 'password'}
                                    required
                                    name="confirm_password"
                                    placeholder="Repeat password"
                                    className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-11 pr-12 text-sm text-gray-800 placeholder-gray-400 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm((v) => !v)}
                                    className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-gray-600"
                                    aria-label="Toggle confirm password"
                                >
                                    {showConfirm ? (
                                        <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" strokeLinecap="round" />
                                            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" strokeLinecap="round" />
                                            <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" />
                                        </svg>
                                    ) : (
                                        <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-70"
                            style={{
                                background: loading
                                    ? '#7c3aed'
                                    : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                                boxShadow: '0 8px 24px rgba(79,70,229,0.35)',
                            }}
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin" width="16" height="16" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                                        <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
                                    </svg>
                                    Creating account...
                                </>
                            ) : (
                                <>
                                    <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
                                        <circle cx="9" cy="7" r="4" />
                                        <line x1="19" y1="8" x2="19" y2="14" strokeLinecap="round" />
                                        <line x1="22" y1="11" x2="16" y2="11" strokeLinecap="round" />
                                    </svg>
                                    Create Account
                                </>
                            )}
                        </button>
                    </form>

                    {/* Sign in link */}
                    <p className="mt-5 text-center text-sm text-gray-500">
                        Already have an account?{' '}
                        <Link href="/auth" className="font-bold text-indigo-600 hover:text-indigo-700">
                            Sign in
                        </Link>
                    </p>

                    {/* Back link */}
                    <div className="mt-3 flex justify-center">
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
