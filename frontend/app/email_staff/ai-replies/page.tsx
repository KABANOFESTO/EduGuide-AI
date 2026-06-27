'use client';

import { useState } from 'react';
import { Filter, Bot, Check, Pencil, AlertTriangle, X } from 'lucide-react';

/* ── Types ── */

type ReplyStatus = 'Pending' | 'Auto-Sent' | 'Escalated' | 'Approved';

interface AIReply {
    id: string;
    ticketNo: string;
    subject: string;
    sender: string;
    confidence: number;
    time: string;
    status: ReplyStatus;
    category: string;
    aiReply: string;
}

/* ── Mock data — replace with real API data ── */

const initialReplies: AIReply[] = [
    {
        id: '1851',
        ticketNo: '#1851',
        subject: 'Semester 2 registration dates',
        sender: 'n.uwimana@student.uok.ac.rw',
        confidence: 94,
        time: '09:12',
        status: 'Pending',
        category: 'Course Registration',
        aiReply:
            'Dear student, Semester 2 course registration opens on 15 February 2025. Please log in to the student portal at your earliest convenience.',
    },
    {
        id: '1849',
        ticketNo: '#1849',
        subject: 'Admission requirements for CS',
        sender: 'j.gasana@student.uok.ac.rw',
        confidence: 97,
        time: '08:44',
        status: 'Auto-Sent',
        category: 'Admission Inquiry',
        aiReply:
            'Dear Applicant, thank you for your interest in our Computer Science program. Admission requires a high school diploma with a strong background in Mathematics and Physics, along with a minimum overall grade as published in our admissions guide.',
    },
    {
        id: '1847',
        ticketNo: '#1847',
        subject: 'Exam retake policy',
        sender: 'alice.ingabire@gmail.com',
        confidence: 91,
        time: '08:20',
        status: 'Approved',
        category: 'Exam & Results',
        aiReply:
            'Dear Student, thank you for your question. Students may retake a failed exam once per course, subject to a retake fee as outlined in the academic policy handbook.',
    },
    {
        id: '1844',
        ticketNo: '#1844',
        subject: 'Library access during holidays',
        sender: 'p.niyonzima@student.uok.ac.rw',
        confidence: 82,
        time: '07:55',
        status: 'Pending',
        category: 'General Admin',
        aiReply:
            'Dear Student, the university library remains open during semester breaks with reduced hours (Mon–Fri, 09:00–15:00). Please bring your student ID for access.',
    },
    {
        id: '1840',
        ticketNo: '#1840',
        subject: 'Tuition fee instalment plan',
        sender: 'b.mutoni@student.uok.ac.rw',
        confidence: 89,
        time: '07:30',
        status: 'Approved',
        category: 'Fee & Payment',
        aiReply:
            'Dear Student, the university offers a 3-instalment payment plan for tuition fees. Please visit the Finance Office or your student portal to enrol in this plan before the term deadline.',
    },
];

/* ── Status badge ── */

function StatusBadge({ status }: { status: ReplyStatus }) {
    const styles: Record<ReplyStatus, string> = {
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

/* ── Reply list row ── */

function ReplyListRow({
    reply,
    active,
    onClick,
}: {
    reply: AIReply;
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
                <span className="text-xs font-medium text-slate-400">{reply.ticketNo}</span>
                <div className="flex items-center gap-2">
                    <ConfidenceBadge confidence={reply.confidence} />
                    <span className="text-xs text-slate-400">{reply.time}</span>
                </div>
            </div>
            <p className="mt-1.5 truncate text-sm font-semibold text-slate-900">{reply.subject}</p>
            <p className="truncate text-xs text-slate-500">{reply.sender}</p>
            <div className="mt-2 flex items-center gap-2">
                <StatusBadge status={reply.status} />
                <span className="truncate text-xs font-medium text-slate-400">{reply.category}</span>
            </div>
        </button>
    );
}

/* ── Info card ── */

function InfoCard({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
            <div className="mt-1.5 text-base font-bold text-slate-900">{value}</div>
        </div>
    );
}

/* ── Page ── */

export default function AIRepliesPage() {
    const [replies, setReplies] = useState<AIReply[]>(initialReplies);
    const [selectedId, setSelectedId] = useState<string>(initialReplies[0].id);
    const [filterOpen, setFilterOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState<ReplyStatus | 'All'>('All');

    const [isEditing, setIsEditing] = useState(false);
    const [draftReply, setDraftReply] = useState('');
    const [toast, setToast] = useState<string | null>(null);

    const filteredReplies =
        statusFilter === 'All' ? replies : replies.filter((r) => r.status === statusFilter);

    const selectedReply = replies.find((r) => r.id === selectedId) ?? null;

    const showToast = (message: string) => {
        setToast(message);
        setTimeout(() => setToast(null), 2200);
    };

    const updateStatus = (id: string, status: ReplyStatus) => {
        setReplies((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    };

    const handleSelect = (id: string) => {
        setSelectedId(id);
        setIsEditing(false);
    };

    const handleApprove = () => {
        if (!selectedReply) return;
        updateStatus(selectedReply.id, 'Approved');
        showToast('Reply approved and sent.');
    };

    const handleStartEdit = () => {
        if (!selectedReply) return;
        setDraftReply(selectedReply.aiReply);
        setIsEditing(true);
    };

    const handleSaveEdit = () => {
        if (!selectedReply) return;
        setReplies((prev) =>
            prev.map((r) => (r.id === selectedReply.id ? { ...r, aiReply: draftReply } : r))
        );
        setIsEditing(false);
        showToast('Reply updated.');
    };

    const handleEscalate = () => {
        if (!selectedReply) return;
        updateStatus(selectedReply.id, 'Escalated');
        showToast('Reply escalated to a reviewer.');
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
                {/* ── Replies list ── */}
                <div className="relative rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                        <h2 className="text-base font-semibold text-slate-900">
                            All AI Replies ({replies.length})
                        </h2>
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
                        {filteredReplies.map((reply) => (
                            <ReplyListRow
                                key={reply.id}
                                reply={reply}
                                active={reply.id === selectedId}
                                onClick={() => handleSelect(reply.id)}
                            />
                        ))}

                        {filteredReplies.length === 0 && (
                            <div className="px-5 py-10 text-center text-sm text-slate-400">
                                No replies match this filter.
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Detail panel ── */}
                <div className="flex min-h-[600px] flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
                    {!selectedReply ? (
                        <div className="flex flex-1 items-center justify-center text-sm text-slate-400">
                            Select a reply to view details.
                        </div>
                    ) : (
                        <>
                            <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
                                <div>
                                    <h1 className="text-lg font-bold text-slate-900">
                                        {selectedReply.subject}
                                    </h1>
                                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm">
                                        <span className="text-slate-500">{selectedReply.sender}</span>
                                        <StatusBadge status={selectedReply.status} />
                                    </div>
                                </div>
                                <ConfidenceBadge confidence={selectedReply.confidence} />
                            </div>

                            <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
                                {/* AI reply / edit mode */}
                                <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-5">
                                    <div className="flex items-center gap-2">
                                        <Bot size={14} className="text-indigo-600" />
                                        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                                            AI-Generated Reply
                                        </p>
                                    </div>

                                    {isEditing ? (
                                        <div className="mt-3 space-y-3">
                                            <textarea
                                                value={draftReply}
                                                onChange={(e) => setDraftReply(e.target.value)}
                                                rows={8}
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
                                            {selectedReply.aiReply}
                                        </p>
                                    )}
                                </div>

                                {/* Info cards */}
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                    <InfoCard label="Intent Class" value={selectedReply.category} />
                                    <InfoCard
                                        label="Confidence"
                                        value={`${selectedReply.confidence}%`}
                                    />
                                    <InfoCard
                                        label="Status"
                                        value={selectedReply.status.toLowerCase()}
                                    />
                                </div>
                            </div>

                            {/* Action bar */}
                            <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 px-6 py-5">
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
                                    Edit
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