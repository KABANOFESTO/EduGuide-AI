'use client';

import { useState } from 'react';

/* ── Types ── */
type SessionStatus = 'Active' | 'Idle';

interface Session {
    id: number;
    email: string;
    browser: string;
    os: string;
    ip: string;
    time: string;
    status: SessionStatus;
}

/* ── Data ── */
const initialSessions: Session[] = [
    { id: 1, email: 'alice.murebwayire@uok.ac.rw', browser: 'Chrome', os: 'Windows', ip: '197.243.12.44', time: 'Today 08:42', status: 'Active' },
    { id: 2, email: 'jean.ndayisaba@uok.ac.rw', browser: 'Firefox', os: 'Ubuntu', ip: '197.243.15.18', time: 'Today 08:39', status: 'Active' },
    { id: 3, email: 'claire.uwimana@uok.ac.rw', browser: 'Safari', os: 'macOS', ip: '197.243.10.7', time: 'Today 07:51', status: 'Idle' },
];

/* ── Dot ── */
function SessionDot({ status }: { status: SessionStatus }) {
    const isActive = status === 'Active';
    return (
        <span className="relative flex h-2.5 w-2.5 shrink-0">
            {isActive && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-50"
                    style={{ background: '#16a34a' }} />
            )}
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full"
                style={{ background: isActive ? '#16a34a' : '#d1d5db' }} />
        </span>
    );
}

/* ── Main ── */
export default function SecurityPage() {
    const [sessions, setSessions] = useState<Session[]>(initialSessions);
    const [threshold, setThreshold] = useState(80);
    const [revokeAllConfirm, setRevokeAllConfirm] = useState(false);
    const [savingThreshold, setSavingThreshold] = useState(false);
    const [thresholdSaved, setThresholdSaved] = useState(false);

    const activeSessions = sessions.filter((s) => s.status === 'Active').length;
    const failedLogins = 3;

    const revokeSession = (id: number) => {
        setSessions((prev) => prev.filter((s) => s.id !== id));
    };

    const revokeAll = () => {
        setSessions([]);
        setRevokeAllConfirm(false);
    };

    const saveThreshold = async () => {
        setSavingThreshold(true);
        await new Promise((r) => setTimeout(r, 1000));
        setSavingThreshold(false);
        setThresholdSaved(true);
        setTimeout(() => setThresholdSaved(false), 2500);
    };

    return (
        <div className="min-h-screen bg-gray-50/60 p-6 lg:p-8">

            {/* Page title */}
            <div className="mb-6">
                <h1 className="text-2xl font-extrabold text-gray-900">Security</h1>
                <p className="mt-0.5 text-sm text-gray-500">Manage sessions, confidence thresholds and access controls.</p>
            </div>

            {/* ── Stat Cards ── */}
            <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {/* Active Sessions */}
                <div className="rounded-2xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                    style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl"
                        style={{ background: 'rgba(79,70,229,0.08)' }}>
                        <svg width="20" height="20" fill="none" stroke="#4f46e5" strokeWidth="1.8" viewBox="0 0 24 24">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <p className="text-3xl font-extrabold text-gray-900">{activeSessions}</p>
                    <p className="mt-0.5 text-sm text-gray-500">Active Sessions</p>
                </div>

                {/* Failed Logins */}
                <div className="rounded-2xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                    style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl"
                        style={{ background: 'rgba(217,119,6,0.08)' }}>
                        <svg width="20" height="20" fill="none" stroke="#d97706" strokeWidth="1.8" viewBox="0 0 24 24">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" strokeLinecap="round" strokeLinejoin="round" />
                            <line x1="12" y1="9" x2="12" y2="13" strokeLinecap="round" />
                            <line x1="12" y1="17" x2="12.01" y2="17" strokeLinecap="round" />
                        </svg>
                    </div>
                    <p className="text-3xl font-extrabold text-gray-900">{failedLogins}</p>
                    <p className="mt-0.5 text-sm text-gray-500">Failed Logins (24h)</p>
                </div>

                {/* Confidence Threshold */}
                <div className="rounded-2xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                    style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl"
                        style={{ background: 'rgba(124,58,237,0.08)' }}>
                        <svg width="20" height="20" fill="none" stroke="#7c3aed" strokeWidth="1.8" viewBox="0 0 24 24">
                            <line x1="4" y1="21" x2="4" y2="14" strokeLinecap="round" />
                            <line x1="4" y1="10" x2="4" y2="3" strokeLinecap="round" />
                            <line x1="12" y1="21" x2="12" y2="12" strokeLinecap="round" />
                            <line x1="12" y1="8" x2="12" y2="3" strokeLinecap="round" />
                            <line x1="20" y1="21" x2="20" y2="16" strokeLinecap="round" />
                            <line x1="20" y1="12" x2="20" y2="3" strokeLinecap="round" />
                            <line x1="1" y1="14" x2="7" y2="14" strokeLinecap="round" />
                            <line x1="9" y1="8" x2="15" y2="8" strokeLinecap="round" />
                            <line x1="17" y1="16" x2="23" y2="16" strokeLinecap="round" />
                        </svg>
                    </div>
                    <p className="text-3xl font-extrabold text-gray-900">{threshold}%</p>
                    <p className="mt-0.5 text-sm text-gray-500">Confidence Threshold</p>
                </div>
            </div>

            {/* ── AI Confidence Dispatch Threshold ── */}
            <div className="mb-5 rounded-2xl bg-white p-6 shadow-sm"
                style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
                <div className="mb-1">
                    <h2 className="text-base font-bold text-gray-900">AI Confidence Dispatch Threshold</h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Emails with AI confidence below this value are escalated to{' '}
                        <span className="font-semibold text-indigo-600">Human Reviewer</span>{' '}
                        instead of being auto-dispatched.
                    </p>
                </div>

                <div className="mt-6">
                    {/* Slider + value */}
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                            <input
                                type="range"
                                min={50}
                                max={95}
                                value={threshold}
                                onChange={(e) => setThreshold(Number(e.target.value))}
                                className="w-full cursor-pointer appearance-none rounded-full"
                                style={{
                                    height: '6px',
                                    background: `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${((threshold - 50) / 45) * 100}%, #e5e7eb ${((threshold - 50) / 45) * 100}%, #e5e7eb 100%)`,
                                    accentColor: '#4f46e5',
                                }}
                            />
                        </div>
                        <span className="w-16 text-right text-xl font-extrabold" style={{ color: '#4f46e5' }}>
                            {threshold}%
                        </span>
                    </div>

                    {/* Labels */}
                    <div className="mt-2 flex justify-between">
                        <span className="text-xs text-gray-400">50% (lenient)</span>
                        <span className="text-xs text-gray-400">95% (strict)</span>
                    </div>

                    {/* Hint */}
                    <div className="mt-4 flex items-start gap-2 rounded-xl p-3"
                        style={{ background: 'rgba(79,70,229,0.05)', border: '1px solid rgba(79,70,229,0.1)' }}>
                        <svg width="14" height="14" className="mt-0.5 shrink-0" fill="none" stroke="#4f46e5" strokeWidth="2" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" strokeLinecap="round" />
                            <line x1="12" y1="16" x2="12.01" y2="16" strokeLinecap="round" />
                        </svg>
                        <p className="text-xs text-indigo-700">
                            {threshold >= 85
                                ? 'Strict mode: most emails will be escalated to human review.'
                                : threshold >= 70
                                    ? 'Balanced mode: moderate escalation rate recommended for production.'
                                    : 'Lenient mode: most emails will be auto-dispatched without review.'}
                        </p>
                    </div>

                    {/* Save button */}
                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={saveThreshold}
                            disabled={savingThreshold}
                            className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 disabled:opacity-70"
                            style={{
                                background: thresholdSaved ? '#16a34a' : 'linear-gradient(135deg,#4f46e5,#7c3aed)',
                                boxShadow: '0 4px 16px rgba(79,70,229,0.25)',
                            }}
                        >
                            {savingThreshold ? (
                                <>
                                    <svg className="animate-spin" width="14" height="14" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                                        <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
                                    </svg>
                                    Saving...
                                </>
                            ) : thresholdSaved ? (
                                <>
                                    <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
                                        <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    Saved!
                                </>
                            ) : (
                                'Save Threshold'
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Active Sessions ── */}
            <div className="rounded-2xl bg-white shadow-sm" style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                    <h2 className="text-base font-bold text-gray-900">Active Sessions</h2>
                    {sessions.length > 0 && (
                        <button
                            onClick={() => setRevokeAllConfirm(true)}
                            className="text-sm font-bold text-red-500 transition-colors hover:text-red-600"
                        >
                            Revoke All
                        </button>
                    )}
                </div>

                {sessions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-14 text-center">
                        <svg width="40" height="40" fill="none" stroke="#d1d5db" strokeWidth="1.5" viewBox="0 0 24 24" className="mb-3">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeLinecap="round" />
                            <circle cx="9" cy="7" r="4" />
                        </svg>
                        <p className="text-sm font-medium text-gray-400">No active sessions</p>
                        <p className="text-xs text-gray-300">All sessions have been revoked</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {sessions.map((s) => (
                            <div
                                key={s.id}
                                className="flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-gray-50/60"
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <SessionDot status={s.status} />
                                    <div className="overflow-hidden">
                                        <p className="truncate text-sm font-semibold text-gray-900">{s.email}</p>
                                        <p className="truncate text-xs text-gray-400">
                                            {s.browser} / {s.os} &middot; IP: {s.ip}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex shrink-0 items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-xs text-gray-400">{s.time}</p>
                                        <p
                                            className="text-xs font-semibold"
                                            style={{ color: s.status === 'Active' ? '#16a34a' : '#9ca3af' }}
                                        >
                                            {s.status}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => revokeSession(s.id)}
                                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-500 transition-colors hover:bg-red-50 hover:border-red-300"
                                    >
                                        Revoke
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Revoke All Confirm Dialog ── */}
            {revokeAllConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
                        style={{ border: '1px solid rgba(0,0,0,0.08)' }}>
                        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl"
                            style={{ background: 'rgba(239,68,68,0.08)' }}>
                            <svg width="20" height="20" fill="none" stroke="#ef4444" strokeWidth="2" viewBox="0 0 24 24">
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" strokeLinecap="round" strokeLinejoin="round" />
                                <line x1="12" y1="9" x2="12" y2="13" strokeLinecap="round" />
                                <line x1="12" y1="17" x2="12.01" y2="17" strokeLinecap="round" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Revoke all sessions?</h3>
                        <p className="mt-2 text-sm text-gray-500">
                            All active users will be immediately signed out and will need to log in again.
                        </p>
                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={() => setRevokeAllConfirm(false)}
                                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={revokeAll}
                                className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-bold text-white hover:bg-red-600"
                            >
                                Revoke All
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}