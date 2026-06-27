'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';

/* ── Types ── */

type SendMethod = 'Auto' | 'Approved';

interface SentEmail {
    id: string;
    ticketNo: string;
    recipient: string;
    subject: string;
    method: SendMethod;
    confidence: number;
    sentAt: string;
}

/* ── Mock data — replace with real API data ── */

const sentEmails: SentEmail[] = [
    {
        id: '1849',
        ticketNo: '#1849',
        recipient: 'j.gasana@student.uok.ac.rw',
        subject: 'Re: Admission requirements for CS',
        method: 'Auto',
        confidence: 97,
        sentAt: 'Today 08:44',
    },
    {
        id: '1847',
        ticketNo: '#1847',
        recipient: 'alice.ingabire@gmail.com',
        subject: 'Re: Exam retake policy',
        method: 'Approved',
        confidence: 91,
        sentAt: 'Today 08:20',
    },
    {
        id: '1840',
        ticketNo: '#1840',
        recipient: 'b.mutoni@student.uok.ac.rw',
        subject: 'Re: Tuition fee instalment plan',
        method: 'Approved',
        confidence: 89,
        sentAt: 'Today 07:30',
    },
    {
        id: '1835',
        ticketNo: '#1835',
        recipient: 'd.mukandori@student.uok.ac.rw',
        subject: 'Re: Hostel application deadline',
        method: 'Auto',
        confidence: 93,
        sentAt: 'Yesterday 16:10',
    },
    {
        id: '1829',
        ticketNo: '#1829',
        recipient: 'k.habimana@student.uok.ac.rw',
        subject: 'Re: Grade appeal process',
        method: 'Approved',
        confidence: 78,
        sentAt: 'Yesterday 14:22',
    },
    {
        id: '1821',
        ticketNo: '#1821',
        recipient: 'r.nzeyimana@student.uok.ac.rw',
        subject: 'Re: Certificate collection',
        method: 'Auto',
        confidence: 96,
        sentAt: 'Yesterday 11:05',
    },
];

/* ── Method badge ── */

function MethodBadge({ method }: { method: SendMethod }) {
    const styles: Record<SendMethod, string> = {
        Auto: 'bg-violet-50 text-violet-600',
        Approved: 'bg-emerald-50 text-emerald-600',
    };
    return (
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[method]}`}>
            {method}
        </span>
    );
}

/* ── Confidence badge ── */

function ConfidenceBadge({ confidence }: { confidence: number }) {
    const color =
        confidence >= 80
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

/* ── Summary card ── */

function SummaryCard({
    value,
    valueColor,
    label,
    sublabel,
}: {
    value: React.ReactNode;
    valueColor: string;
    label: string;
    sublabel: string;
}) {
    return (
        <div className="flex-1 rounded-2xl border border-slate-200 bg-white px-6 py-7 text-center shadow-sm">
            <p className={`text-3xl font-extrabold ${valueColor}`}>{value}</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{label}</p>
            <p className="mt-0.5 text-xs text-slate-400">{sublabel}</p>
        </div>
    );
}

/* ── CSV export helper ── */

function exportToCSV(emails: SentEmail[]) {
    const header = ['ID', 'Recipient', 'Subject', 'Method', 'Confidence', 'Sent At'];
    const rows = emails.map((e) => [
        e.ticketNo,
        e.recipient,
        e.subject,
        e.method,
        `${e.confidence}%`,
        e.sentAt,
    ]);

    const csvContent = [header, ...rows]
        .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sent-emails-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/* ── Page ── */

export default function SentEmailsPage() {
    const [emails] = useState<SentEmail[]>(sentEmails);

    const totalSent = emails.length;
    const autoDispatched = emails.filter((e) => e.method === 'Auto').length;
    const staffApproved = emails.filter((e) => e.method === 'Approved').length;
    const automationRate = totalSent > 0 ? Math.round((autoDispatched / totalSent) * 100) : 0;

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="mx-auto max-w-6xl">
                {/* Table card */}
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                        <h1 className="text-base font-semibold text-slate-900">
                            Sent Emails ({totalSent})
                        </h1>
                        <button
                            onClick={() => exportToCSV(emails)}
                            className="flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                        >
                            <Download size={15} />
                            Export
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px] text-left">
                            <thead>
                                <tr className="border-b border-slate-100">
                                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                        ID
                                    </th>
                                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                        Recipient
                                    </th>
                                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                        Subject
                                    </th>
                                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                        Method
                                    </th>
                                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                        Confidence
                                    </th>
                                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                        Sent At
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {emails.map((email) => (
                                    <tr
                                        key={email.id}
                                        className="border-b border-slate-50 transition-colors hover:bg-slate-50"
                                    >
                                        <td className="px-6 py-4 text-sm font-medium text-slate-400">
                                            {email.ticketNo}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-indigo-600">
                                            {email.recipient}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-slate-900">
                                            {email.subject}
                                        </td>
                                        <td className="px-6 py-4">
                                            <MethodBadge method={email.method} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <ConfidenceBadge confidence={email.confidence} />
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-400">
                                            {email.sentAt}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {emails.length === 0 && (
                            <div className="px-6 py-10 text-center text-sm text-slate-400">
                                No sent emails yet.
                            </div>
                        )}
                    </div>
                </div>

                {/* Summary cards */}
                <div className="mt-6 flex flex-col gap-5 sm:flex-row">
                    <SummaryCard
                        value={totalSent}
                        valueColor="text-indigo-600"
                        label="Total Sent"
                        sublabel="Last 48 hours"
                    />
                    <SummaryCard
                        value={autoDispatched}
                        valueColor="text-violet-600"
                        label="Auto-Dispatched"
                        sublabel={`${automationRate}% automation rate`}
                    />
                    <SummaryCard
                        value={staffApproved}
                        valueColor="text-emerald-600"
                        label="Staff Approved"
                        sublabel="Manual approval"
                    />
                </div>
            </div>
        </div>
    );
}