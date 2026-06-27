'use client';

import { useState } from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare, Info } from 'lucide-react';

/* ── Types ── */

type FeedbackRating = 'positive' | 'negative';

interface FeedbackEntry {
    id: string;
    ticketNo: string;
    subject: string;
    comment: string;
    rating: FeedbackRating;
    time: string;
}

/* ── Mock data — replace with real API data ── */

const initialFeedback: FeedbackEntry[] = [
    {
        id: '1849',
        ticketNo: '#1849',
        subject: 'Admission requirements for CS',
        comment: 'Accurate and professional.',
        rating: 'positive',
        time: 'Today 08:45',
    },
    {
        id: '1847',
        ticketNo: '#1847',
        subject: 'Exam retake policy',
        comment: 'Correct policy cited.',
        rating: 'positive',
        time: 'Today 08:22',
    },
    {
        id: '1840',
        ticketNo: '#1840',
        subject: 'Tuition fee instalment plan',
        comment: 'Instalment percentages were outdated — had to edit.',
        rating: 'negative',
        time: 'Today 07:32',
    },
    {
        id: '1835',
        ticketNo: '#1835',
        subject: 'Hostel application deadline',
        comment: 'Perfect. No edit needed.',
        rating: 'positive',
        time: 'Yesterday 16:12',
    },
];

/* ── Stat card ── */

function StatCard({
    icon: Icon,
    iconColor,
    iconBg,
    value,
    label,
    sublabel,
    sublabelColor,
}: {
    icon: React.ElementType;
    iconColor: string;
    iconBg: string;
    value: number;
    label: string;
    sublabel: string;
    sublabelColor: string;
}) {
    return (
        <div className="flex-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div
                className="mb-4 flex h-9 w-9 items-center justify-center rounded-full"
                style={{ background: iconBg }}
            >
                <Icon size={18} style={{ color: iconColor }} />
            </div>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="mt-1 text-sm font-medium text-slate-700">{label}</p>
            <p className={`mt-0.5 text-xs font-semibold ${sublabelColor}`}>{sublabel}</p>
        </div>
    );
}

/* ── Feedback row ── */

function FeedbackRow({ entry }: { entry: FeedbackEntry }) {
    const isPositive = entry.rating === 'positive';
    return (
        <div className="flex items-start gap-4 px-6 py-4 transition-colors hover:bg-slate-50">
            <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${isPositive ? 'bg-emerald-50' : 'bg-red-50'
                    }`}
            >
                {isPositive ? (
                    <ThumbsUp size={15} className="text-emerald-600" />
                ) : (
                    <ThumbsDown size={15} className="text-red-500" />
                )}
            </div>

            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900">{entry.subject}</p>
                    <span className="text-xs font-medium text-slate-400">{entry.ticketNo}</span>
                </div>
                <p className="mt-0.5 text-sm text-indigo-600">&ldquo;{entry.comment}&rdquo;</p>
                <p className="mt-1 text-xs text-slate-400">{entry.time}</p>
            </div>
        </div>
    );
}

/* ── Page ── */

export default function MyFeedbackPage() {
    const [feedback] = useState<FeedbackEntry[]>(initialFeedback);

    const positiveCount = feedback.filter((f) => f.rating === 'positive').length;
    const negativeCount = feedback.filter((f) => f.rating === 'negative').length;
    const total = feedback.length;

    const positivePct = total > 0 ? Math.round((positiveCount / total) * 100) : 0;
    const negativePct = total > 0 ? Math.round((negativeCount / total) * 100) : 0;

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="mx-auto max-w-6xl">
                {/* Stat cards */}
                <div className="flex flex-col gap-5 sm:flex-row">
                    <StatCard
                        icon={ThumbsUp}
                        iconColor="#16a34a"
                        iconBg="#ecfdf3"
                        value={positiveCount}
                        label="Positive Ratings"
                        sublabel={`${positivePct}%`}
                        sublabelColor="text-emerald-600"
                    />
                    <StatCard
                        icon={ThumbsDown}
                        iconColor="#ef4444"
                        iconBg="#fef2f2"
                        value={negativeCount}
                        label="Negative Ratings"
                        sublabel={`${negativePct}%`}
                        sublabelColor="text-red-500"
                    />
                    <StatCard
                        icon={MessageSquare}
                        iconColor="#4f46e5"
                        iconBg="#eef2ff"
                        value={total}
                        label="Total Feedback Given"
                        sublabel="This session"
                        sublabelColor="text-indigo-600"
                    />
                </div>

                {/* Feedback history */}
                <div className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 px-6 py-5">
                        <h2 className="text-base font-semibold text-slate-900">My Feedback History</h2>
                    </div>

                    <div className="divide-y divide-slate-100">
                        {feedback.map((entry) => (
                            <FeedbackRow key={entry.id} entry={entry} />
                        ))}
                    </div>

                    {feedback.length === 0 && (
                        <div className="px-6 py-10 text-center text-sm text-slate-400">
                            You haven&rsquo;t given any feedback yet.
                        </div>
                    )}
                </div>

                {/* Info banner */}
                <div className="mt-6 flex items-start gap-3 rounded-2xl border border-indigo-100 bg-indigo-50 px-6 py-5">
                    <Info size={18} className="mt-0.5 shrink-0 text-indigo-600" />
                    <div>
                        <p className="text-sm font-semibold text-indigo-700">
                            Your feedback trains the model
                        </p>
                        <p className="mt-0.5 text-sm text-indigo-600/80">
                            Every rating you submit is fed into the AI retraining pipeline. Negative
                            feedback with comments helps the AI Model Manager identify areas for
                            improvement and schedule targeted fine-tuning.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}