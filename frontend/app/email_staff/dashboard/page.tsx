'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Inbox, Send, Bot, AlertTriangle, ArrowRight } from 'lucide-react';

/* ── Types ── */

interface StatCard {
    label: string;
    value: number;
    sublabel: string;
    sublabelColor: string;
    icon: React.ElementType;
    iconColor: string;
    iconBg: string;
}

type EmailStatus = 'Pending' | 'Auto-Sent' | 'Escalated' | 'Approved';

interface RecentEmail {
    id: string;
    initial: string;
    subject: string;
    sender: string;
    status: EmailStatus;
    category: string;
    confidence: number;
    time: string;
}

/* ── Mock data — replace with real API data ── */

const stats: StatCard[] = [
    {
        label: 'Inbox Today',
        value: 18,
        sublabel: '5 need action',
        sublabelColor: 'text-slate-500',
        icon: Inbox,
        iconColor: '#4f46e5',
        iconBg: '#eef2ff',
    },
    {
        label: 'Approved & Sent',
        value: 9,
        sublabel: 'Today',
        sublabelColor: 'text-slate-500',
        icon: Send,
        iconColor: '#16a34a',
        iconBg: '#ecfdf3',
    },
    {
        label: 'Auto-Dispatched',
        value: 6,
        sublabel: 'High confidence',
        sublabelColor: 'text-indigo-600',
        icon: Bot,
        iconColor: '#9333ea',
        iconBg: '#f5edff',
    },
    {
        label: 'Escalated',
        value: 3,
        sublabel: 'Awaiting reviewer',
        sublabelColor: 'text-amber-600',
        icon: AlertTriangle,
        iconColor: '#d97706',
        iconBg: '#fef6e7',
    },
];

const recentEmails: RecentEmail[] = [
    {
        id: '1',
        initial: 'N',
        subject: 'When does Semester 2 registration open?',
        sender: 'n.uwimana@student.uok.ac.rw',
        status: 'Pending',
        category: 'Course Registration',
        confidence: 94,
        time: '09:12',
    },
    {
        id: '2',
        initial: 'K',
        subject: 'Fee payment deadline extension request',
        sender: 'k.habimana@student.uok.ac.rw',
        status: 'Pending',
        category: 'Fee & Payment',
        confidence: 88,
        time: '08:55',
    },
    {
        id: '3',
        initial: 'J',
        subject: 'I want to know admission requirements for CS',
        sender: 'j.gasana@student.uok.ac.rw',
        status: 'Auto-Sent',
        category: 'Admission Inquiry',
        confidence: 97,
        time: '08:44',
    },
    {
        id: '4',
        initial: 'M',
        subject: 'Requesting my transcript for visa application',
        sender: 'm.uwase@student.uok.ac.rw',
        status: 'Escalated',
        category: 'General Admin',
        confidence: 72,
        time: '08:33',
    },
];

/* ── Status badge ── */

function StatusBadge({ status }: { status: EmailStatus }) {
    const styles: Record<EmailStatus, string> = {
        Pending: 'bg-amber-50 text-amber-600',
        'Auto-Sent': 'bg-indigo-50 text-indigo-600',
        Escalated: 'bg-red-50 text-red-600',
        Approved: 'bg-emerald-50 text-emerald-600',
    };
    return (
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[status]}`}>
            {status}
        </span>
    );
}

/* ── Confidence badge ── */

function ConfidenceBadge({ confidence }: { confidence: number }) {
    const color =
        confidence >= 90
            ? 'bg-emerald-50 text-emerald-600'
            : confidence >= 80
                ? 'bg-emerald-50 text-emerald-600'
                : confidence >= 75
                    ? 'bg-amber-50 text-amber-600'
                    : 'bg-orange-50 text-orange-600';
    return (
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${color}`}>
            {confidence}%
        </span>
    );
}

/* ── Stat card ── */

function StatCardItem({ stat }: { stat: StatCard }) {
    const Icon = stat.icon;
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div
                className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl"
                style={{ background: stat.iconBg }}
            >
                <Icon size={18} style={{ color: stat.iconColor }} />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="mt-1 text-sm font-medium text-slate-700">{stat.label}</p>
            <p className={`mt-0.5 text-xs font-medium ${stat.sublabelColor}`}>{stat.sublabel}</p>
        </div>
    );
}

/* ── Recent email row ── */

function EmailRow({ email }: { email: RecentEmail }) {
    return (
        <div className="flex items-start gap-4 px-6 py-4 transition-colors hover:bg-slate-50">
            <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
            >
                {email.initial}
            </div>

            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-slate-900">{email.subject}</p>
                    <StatusBadge status={email.status} />
                </div>
                <p className="mt-0.5 truncate text-sm text-slate-500">{email.sender}</p>
                <div className="mt-1.5 flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-400">{email.category}</span>
                    <ConfidenceBadge confidence={email.confidence} />
                </div>
            </div>

            <span className="shrink-0 text-xs text-slate-400">{email.time}</span>
        </div>
    );
}

/* ── Page ── */

export default function DashboardOverview() {
    const [emails] = useState<RecentEmail[]>(recentEmails);

    return (
        <div className="min-h-screen bg-slate-50 px-6 py-8">
            <div className="mx-auto max-w-6xl">
                {/* Stat cards */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat) => (
                        <StatCardItem key={stat.label} stat={stat} />
                    ))}
                </div>

                {/* Recent emails */}
                <div className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                        <h2 className="text-base font-semibold text-slate-900">Recent Emails</h2>
                        <Link
                            href="/staff/inbox"
                            className="flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                        >
                            View all
                            <ArrowRight size={14} />
                        </Link>
                    </div>

                    <div className="divide-y divide-slate-100">
                        {emails.map((email) => (
                            <EmailRow key={email.id} email={email} />
                        ))}
                    </div>

                    {emails.length === 0 && (
                        <div className="px-6 py-10 text-center text-sm text-slate-400">
                            No recent emails to show.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}