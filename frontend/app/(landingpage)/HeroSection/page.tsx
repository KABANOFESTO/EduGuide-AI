'use client';

import Link from 'next/link';

export default function HeroSection() {
    return (
        <section
            id="home"
            className="relative min-h-screen w-full overflow-hidden"
            style={{
                background: 'linear-gradient(135deg, #f0f2ff 0%, #e8eaff 30%, #f5f0ff 60%, #eef2ff 100%)',
            }}
        >
            {/* Grid background */}
            <div
                className="pointer-events-none absolute inset-0"
                style={{
                    backgroundImage:
                        'linear-gradient(rgba(99,102,241,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.07) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                }}
            />

            {/* Glow blobs */}
            <div
                className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full opacity-40 blur-3xl"
                style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.35) 0%, transparent 70%)' }}
            />
            <div
                className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full opacity-30 blur-3xl"
                style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)' }}
            />

            <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-16 px-6 py-20 lg:flex-row lg:items-center lg:gap-12 lg:px-10 lg:py-28">

                {/* ── Left Column ── */}
                <div className="flex flex-1 flex-col items-start">

                    {/* Headline */}
                    <h1 className="text-5xl font-extrabold leading-tight tracking-tight text-gray-900 xl:text-6xl">
                        Intelligent{' '}
                        <span style={{ color: '#4f46e5' }}>Email</span>
                        <br />
                        <span style={{ color: '#7c3aed' }}>Auto-Reply</span>{' '}
                        for
                        <br />
                        Modern
                        <br />
                        Universities
                    </h1>

                    {/* Subheading */}
                    <p className="mt-6 max-w-md text-base leading-relaxed text-gray-500">
                        A BERT + T5-powered NLP pipeline that classifies institutional emails
                        into 5 intent categories and generates contextually accurate automated
                        responses.
                    </p>

                    {/* CTA Buttons */}
                    <div className="mt-8 flex flex-wrap items-center gap-4">
                        <Link
                            href="/auth/signup"
                            className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
                            style={{
                                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                                boxShadow: '0 8px 24px rgba(79,70,229,0.35)',
                            }}
                        >
                            Access the System
                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </Link>

                        <Link
                            href="/auth"
                            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-all duration-200 hover:border-gray-300 hover:shadow-md"
                        >
                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                                <polyline points="10 17 15 12 10 7" />
                                <line x1="15" y1="12" x2="3" y2="12" />
                            </svg>
                            Sign In
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="mt-10 flex flex-wrap items-center gap-8">
                        <div>
                            <p className="text-2xl font-extrabold" style={{ color: '#4f46e5' }}>500k+</p>
                            <p className="mt-0.5 text-xs text-gray-500">Training Emails</p>
                        </div>
                        <div
                            className="h-8 w-px"
                            style={{ background: 'rgba(99,102,241,0.2)' }}
                        />
                        <div>
                            <p className="text-2xl font-extrabold" style={{ color: '#4f46e5' }}>&gt;90%</p>
                            <p className="mt-0.5 text-xs text-gray-500">F1 Accuracy</p>
                        </div>
                        <div
                            className="h-8 w-px"
                            style={{ background: 'rgba(99,102,241,0.2)' }}
                        />
                        <div>
                            <p className="text-2xl font-extrabold" style={{ color: '#4f46e5' }}>&lt;3s</p>
                            <p className="mt-0.5 text-xs text-gray-500">Response Time</p>
                        </div>
                    </div>
                </div>

                {/* ── Right Column — Pipeline Card ── */}
                <div className="flex flex-1 justify-center lg:justify-end">
                    <div
                        className="w-full max-w-lg overflow-hidden rounded-2xl shadow-2xl"
                        style={{
                            background: '#ffffff',
                            border: '1px solid rgba(99,102,241,0.12)',
                            boxShadow: '0 24px 64px rgba(79,70,229,0.15)',
                        }}
                    >
                        {/* Card Header */}
                        <div
                            className="flex items-center gap-3 px-5 py-3.5"
                            style={{
                                background: 'linear-gradient(90deg, #4f46e5, #7c3aed)',
                            }}
                        >
                            <div className="flex gap-1.5">
                                <span className="h-3 w-3 rounded-full bg-red-400" />
                                <span className="h-3 w-3 rounded-full bg-yellow-400" />
                                <span className="h-3 w-3 rounded-full bg-green-400" />
                            </div>
                            <span className="text-xs font-semibold tracking-widest text-white/90">
                                Pipeline Active
                            </span>
                        </div>

                        <div className="p-5 space-y-4">
                            {/* Incoming Email */}
                            <div
                                className="flex items-start gap-3 rounded-xl p-4"
                                style={{ background: '#f8f9ff', border: '1px solid rgba(99,102,241,0.1)' }}
                            >
                                <div
                                    className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                                    style={{ background: 'rgba(99,102,241,0.1)' }}
                                >
                                    <svg width="15" height="15" fill="none" stroke="#4f46e5" strokeWidth="2" viewBox="0 0 24 24">
                                        <rect x="2" y="4" width="20" height="16" rx="2" />
                                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-800">Incoming Email</p>
                                    <p className="mt-0.5 text-xs text-gray-500">
                                        &ldquo;When does course registration open for Semester 2?&rdquo;
                                    </p>
                                </div>
                            </div>

                            {/* Pipeline Stages */}
                            <div className="space-y-3">
                                {/* Stage 1 */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <span className="h-2 w-2 rounded-full bg-green-500" />
                                        <span
                                            className="rounded px-1.5 py-0.5 text-[10px] font-bold"
                                            style={{ background: 'rgba(99,102,241,0.1)', color: '#4f46e5' }}
                                        >
                                            Stage 1
                                        </span>
                                        <span className="text-xs text-gray-600">Tokenisation &amp; Feature Extraction</span>
                                    </div>
                                    <span
                                        className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
                                        style={{ background: 'rgba(34,197,94,0.1)', color: '#16a34a' }}
                                    >
                                        Complete
                                    </span>
                                </div>

                                {/* Stage 2a */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <span className="h-2 w-2 rounded-full bg-green-500" />
                                        <span
                                            className="rounded px-1.5 py-0.5 text-[10px] font-bold"
                                            style={{ background: 'rgba(99,102,241,0.1)', color: '#4f46e5' }}
                                        >
                                            Stage 2
                                        </span>
                                        <span className="text-xs text-gray-600">
                                            BERT &#8594; Course Registration (94.2%)
                                        </span>
                                    </div>
                                    <span
                                        className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
                                        style={{ background: 'rgba(34,197,94,0.1)', color: '#16a34a' }}
                                    >
                                        Complete
                                    </span>
                                </div>

                                {/* Stage 2b */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <span className="h-2 w-2 rounded-full bg-yellow-400" />
                                        <span
                                            className="rounded px-1.5 py-0.5 text-[10px] font-bold"
                                            style={{ background: 'rgba(99,102,241,0.1)', color: '#4f46e5' }}
                                        >
                                            Stage 2
                                        </span>
                                        <span className="text-xs text-gray-600">T5 Response Generation</span>
                                    </div>
                                    <span
                                        className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
                                        style={{ background: 'rgba(234,179,8,0.1)', color: '#ca8a04' }}
                                    >
                                        Processing...
                                    </span>
                                </div>

                                {/* Stage 3 */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <span className="h-2 w-2 rounded-full bg-blue-500" />
                                        <span
                                            className="rounded px-1.5 py-0.5 text-[10px] font-bold"
                                            style={{ background: 'rgba(99,102,241,0.1)', color: '#4f46e5' }}
                                        >
                                            Stage 3
                                        </span>
                                        <span className="text-xs text-gray-600">Auto-dispatch eligible</span>
                                    </div>
                                    <span
                                        className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
                                        style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1' }}
                                    >
                                        Queued
                                    </span>
                                </div>
                            </div>

                            {/* AI Generated Reply */}
                            <div
                                className="rounded-xl p-4 space-y-3"
                                style={{
                                    background: 'rgba(99,102,241,0.04)',
                                    border: '1px solid rgba(99,102,241,0.12)',
                                }}
                            >
                                <div className="flex items-center gap-2">
                                    <svg width="13" height="13" fill="none" stroke="#7c3aed" strokeWidth="2" viewBox="0 0 24 24">
                                        <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" />
                                        <path d="M12 6v6l4 2" />
                                    </svg>
                                    <span
                                        className="text-[10px] font-bold uppercase tracking-wider"
                                        style={{ color: '#7c3aed' }}
                                    >
                                        AI-Generated Reply
                                    </span>
                                </div>
                                <p className="text-xs leading-relaxed text-gray-600">
                                    &ldquo;Dear student, Semester 2 registration opens{' '}
                                    <strong className="text-gray-800">15 February 2025</strong>. Log in to the
                                    student portal to review available courses...&rdquo;
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        className="rounded-lg px-4 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                                        style={{ background: '#16a34a' }}
                                    >
                                        Approve &amp; Send
                                    </button>
                                    <button
                                        type="button"
                                        className="rounded-lg border border-gray-200 bg-white px-4 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50"
                                    >
                                        Edit
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Card Footer */}
                        <div
                            className="flex items-center justify-end gap-1.5 px-5 py-3"
                            style={{ borderTop: '1px solid rgba(99,102,241,0.08)' }}
                        >
                            <span className="h-2 w-2 rounded-full bg-green-500" />
                            <span className="text-xs font-medium text-gray-400">Pipeline Active</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}