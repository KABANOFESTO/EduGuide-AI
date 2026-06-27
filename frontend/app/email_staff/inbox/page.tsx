'use client';

import { useState } from 'react';
import { Filter, Bot, Check, Pencil, AlertTriangle, ThumbsUp, ThumbsDown, X } from 'lucide-react';

/* ── Types ── */

type EmailStatus = 'Pending' | 'Auto-Sent' | 'Escalated' | 'Approved';

interface EmailItem {
    id: string;
    ticketNo: string;
    subject: string;
    sender: string;
    confidence: number;
    time: string;
    status: EmailStatus;
    category: string;
    originalBody: string;
    aiReply: string;
}

/* ── Mock data — replace with real API data ── */

const initialEmails: EmailItem[] = [
    {
        id: '1851',
        ticketNo: '#1851',
        subject: 'When does Semester 2 registration open?',
        sender: 'n.uwimana@student.uok.ac.rw',
        confidence: 94,
        time: '09:12',
        status: 'Pending',
        category: 'Course Registration',
        originalBody:
            "When does Semester 2 registration open?. I would like to get detailed information about this matter from the registrar's office. Please advise at your earliest convenience. Best regards.",
        aiReply:
            "Dear Student,\n\nThank you for contacting the University of Kigali. Regarding your enquiry on Course Registration, please note that our office is available to assist you during working hours (Mon–Fri, 08:00–17:00).\n\nFor detailed information, kindly visit our student portal or contact us directly at registrar@uok.ac.rw.\n\nKind regards,\nUoK Registrar's Office",
    },
    {
        id: '1850',
        ticketNo: '#1850',
        subject: 'Fee payment deadline extension request',
        sender: 'k.habimana@student.uok.ac.rw',
        confidence: 88,
        time: '08:55',
        status: 'Pending',
        category: 'Fee & Payment',
        originalBody:
            'I am writing to request an extension on my fee payment deadline due to a delay in my scholarship disbursement. Kindly advise on the process.',
        aiReply:
            'Dear Student,\n\nThank you for reaching out regarding your fee payment deadline. Extension requests are reviewed by the Finance Office on a case-by-case basis.\n\nPlease submit a formal request along with supporting documents (e.g. scholarship confirmation letter) to finance@uok.ac.rw.\n\nKind regards,\nUoK Finance Office',
    },
    {
        id: '1849',
        ticketNo: '#1849',
        subject: 'I want to know admission requirements for CS',
        sender: 'j.gasana@student.uok.ac.rw',
        confidence: 97,
        time: '08:44',
        status: 'Auto-Sent',
        category: 'Admission Inquiry',
        originalBody:
            'Hello, I am interested in applying for the Computer Science program. Could you tell me the admission requirements?',
        aiReply:
            'Dear Applicant,\n\nThank you for your interest in our Computer Science program. Admission requires a high school diploma with a strong background in Mathematics and Physics, along with a minimum overall grade as published in our admissions guide.\n\nFor full details, please visit admissions.uok.ac.rw.\n\nKind regards,\nUoK Admissions Office',
    },
    {
        id: '1848',
        ticketNo: '#1848',
        subject: 'Requesting my transcript for visa application',
        sender: 'm.uwase@student.uok.ac.rw',
        confidence: 72,
        time: '08:33',
        status: 'Escalated',
        category: 'General Admin',
        originalBody:
            'I urgently need my official transcript for a visa application interview next week. Please let me know the fastest way to obtain this.',
        aiReply:
            'Dear Student,\n\nThank you for your request. Official transcripts for visa purposes require manual verification by the Registrar.\n\nThis case has been escalated to a staff reviewer who will follow up with you shortly regarding expedited processing.\n\nKind regards,\nUoK Registrar\'s Office',
    },
    {
        id: '1847',
        ticketNo: '#1847',
        subject: 'Exam retake policy question',
        sender: 'alice.ingabire@gmail.com',
        confidence: 91,
        time: '08:20',
        status: 'Approved',
        category: 'Academic Policy',
        originalBody:
            'Hi, I failed one of my exams last semester. What is the policy on retakes and is there a fee involved?',
        aiReply:
            'Dear Student,\n\nThank you for your question. Students may retake a failed exam once per course, subject to a retake fee as outlined in the academic policy handbook.\n\nPlease contact your faculty office to register for the retake session.\n\nKind regards,\nUoK Academic Affairs',
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

/* ── Email list row ── */

function EmailListRow({
    email,
    active,
    onClick,
}: {
    email: EmailItem;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={`block w-full border-b border-slate-100 px-5 py-4 text-left transition-colors ${active ? 'bg-indigo-50' : 'hover:bg-slate-50'
                }`}
        >
            <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">{email.ticketNo}</span>
                <div className="flex items-center gap-2">
                    <ConfidenceBadge confidence={email.confidence} />
                    <span className="text-xs text-slate-400">{email.time}</span>
                </div>
            </div>
            <p className="mt-1.5 truncate text-sm font-semibold text-slate-900">{email.subject}</p>
            <p className="truncate text-xs text-slate-500">{email.sender}</p>
            <div className="mt-2">
                <StatusBadge status={email.status} />
            </div>
        </button>
    );
}

/* ── Page ── */

export default function EmailInboxPage() {
    const [emails, setEmails] = useState<EmailItem[]>(initialEmails);
    const [selectedId, setSelectedId] = useState<string>(initialEmails[0].id);
    const [filterOpen, setFilterOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState<EmailStatus | 'All'>('All');

    const [isEditing, setIsEditing] = useState(false);
    const [draftReply, setDraftReply] = useState('');
    const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
    const [toast, setToast] = useState<string | null>(null);

    const filteredEmails =
        statusFilter === 'All' ? emails : emails.filter((e) => e.status === statusFilter);

    const selectedEmail = emails.find((e) => e.id === selectedId) ?? null;

    const showToast = (message: string) => {
        setToast(message);
        setTimeout(() => setToast(null), 2200);
    };

    const updateStatus = (id: string, status: EmailStatus) => {
        setEmails((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
    };

    const handleSelect = (id: string) => {
        setSelectedId(id);
        setIsEditing(false);
        setFeedback(null);
    };

    const handleApprove = () => {
        if (!selectedEmail) return;
        updateStatus(selectedEmail.id, 'Approved');
        showToast('Reply approved and sent.');
    };

    const handleStartEdit = () => {
        if (!selectedEmail) return;
        setDraftReply(selectedEmail.aiReply);
        setIsEditing(true);
    };

    const handleSaveEdit = () => {
        if (!selectedEmail) return;
        setEmails((prev) =>
            prev.map((e) => (e.id === selectedEmail.id ? { ...e, aiReply: draftReply } : e))
        );
        setIsEditing(false);
        showToast('Reply updated.');
    };

    const handleEscalate = () => {
        if (!selectedEmail) return;
        updateStatus(selectedEmail.id, 'Escalated');
        showToast('Email escalated to a reviewer.');
    };

    const handleFeedback = (value: 'up' | 'down') => {
        setFeedback(value);
        showToast(value === 'up' ? 'Thanks for the feedback!' : 'Feedback noted — we’ll improve this.');
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
                {/* ── Inbox list ── */}
                <div className="relative rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                        <h2 className="text-base font-semibold text-slate-900">Inbox</h2>
                        <button
                            onClick={() => setFilterOpen((v) => !v)}
                            aria-label="Filter"
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                        >
                            <Filter size={16} />
                        </button>

                        {filterOpen && (
                            <div className="absolute right-4 top-12 z-10 w-44 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
                                {(['All', 'Pending', 'Auto-Sent', 'Escalated', 'Approved'] as const).map(
                                    (option) => (
                                        <button
                                            key={option}
                                            onClick={() => {
                                                setStatusFilter(option);
                                                setFilterOpen(false);
                                            }}
                                            className={`block w-full rounded-lg px-3 py-2 text-left text-sm font-medium ${statusFilter === option
                                                    ? 'bg-indigo-50 text-indigo-600'
                                                    : 'text-slate-600 hover:bg-slate-50'
                                                }`}
                                        >
                                            {option}
                                        </button>
                                    )
                                )}
                            </div>
                        )}
                    </div>

                    <div className="max-h-[720px] overflow-y-auto">
                        {filteredEmails.map((email) => (
                            <EmailListRow
                                key={email.id}
                                email={email}
                                active={email.id === selectedId}
                                onClick={() => handleSelect(email.id)}
                            />
                        ))}

                        {filteredEmails.length === 0 && (
                            <div className="px-5 py-10 text-center text-sm text-slate-400">
                                No emails match this filter.
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Detail panel ── */}
                <div className="flex min-h-[600px] flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
                    {!selectedEmail ? (
                        <div className="flex flex-1 items-center justify-center text-sm text-slate-400">
                            Select an email to view details.
                        </div>
                    ) : (
                        <>
                            <div className="border-b border-slate-100 px-6 py-5">
                                <h1 className="text-lg font-bold text-slate-900">{selectedEmail.subject}</h1>
                                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm">
                                    <span className="text-slate-500">From: {selectedEmail.sender}</span>
                                    <ConfidenceBadge confidence={selectedEmail.confidence} />
                                    <StatusBadge status={selectedEmail.status} />
                                </div>
                            </div>

                            <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
                                {/* Original email */}
                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                        Original Email
                                    </p>
                                    <p className="mt-2 text-sm leading-relaxed text-slate-700">
                                        {selectedEmail.originalBody}
                                    </p>
                                </div>

                                {/* AI reply / edit mode */}
                                <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-5">
                                    <div className="flex items-center gap-2">
                                        <Bot size={14} className="text-indigo-600" />
                                        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                                            AI-Generated Reply
                                        </p>
                                        <ConfidenceBadge confidence={selectedEmail.confidence} />
                                    </div>

                                    {isEditing ? (
                                        <div className="mt-3 space-y-3">
                                            <textarea
                                                value={draftReply}
                                                onChange={(e) => setDraftReply(e.target.value)}
                                                rows={10}
                                                className="w-full rounded-lg border border-indigo-200 bg-white p-3 text-sm leading-relaxed text-slate-800 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                                            />
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => setIsEditing(false)}
                                                    className="flex items-center gap-1.5 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                                                >
                                                    <X size={14} />
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={handleSaveEdit}
                                                    className="flex items-center gap-1.5 rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                                                >
                                                    <Check size={14} />
                                                    Save changes
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-800">
                                            {selectedEmail.aiReply}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Action bar */}
                            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 px-6 py-5">
                                <div className="flex flex-wrap items-center gap-3">
                                    <button
                                        onClick={handleApprove}
                                        disabled={isEditing}
                                        className="flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <Check size={15} />
                                        Approve & Send
                                    </button>
                                    <button
                                        onClick={handleStartEdit}
                                        disabled={isEditing}
                                        className="flex items-center gap-2 rounded-full bg-indigo-50 px-5 py-2.5 text-sm font-semibold text-indigo-700 transition-colors hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <Pencil size={15} />
                                        Edit Reply
                                    </button>
                                    <button
                                        onClick={handleEscalate}
                                        disabled={isEditing}
                                        className="flex items-center gap-2 rounded-full bg-amber-50 px-5 py-2.5 text-sm font-semibold text-amber-700 transition-colors hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <AlertTriangle size={15} />
                                        Escalate
                                    </button>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-slate-400">
                                    Was this reply good?
                                    <button
                                        onClick={() => handleFeedback('up')}
                                        aria-label="Good reply"
                                        className={`rounded-lg p-1.5 transition-colors hover:bg-slate-100 ${feedback === 'up' ? 'text-emerald-600' : 'text-slate-400'
                                            }`}
                                    >
                                        <ThumbsUp size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleFeedback('down')}
                                        aria-label="Bad reply"
                                        className={`rounded-lg p-1.5 transition-colors hover:bg-slate-100 ${feedback === 'down' ? 'text-red-500' : 'text-slate-400'
                                            }`}
                                    >
                                        <ThumbsDown size={16} />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Toast */}
            {toast && (
                <div className="fixed bottom-6 right-6 z-50 rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-lg">
                    {toast}
                </div>
            )}
        </div>
    );
}