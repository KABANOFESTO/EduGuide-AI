"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Check, Loader2, RefreshCw, X } from "lucide-react";

import { useGetEmailsQuery, useReviewEmailMutation } from "@/lib/redux/silces/EmailSlice";

type LiveEmail = {
    id: number;
    sender_name: string;
    sender_email: string;
    subject: string;
    body: string;
    status: "PENDING" | "PROCESSED" | "REVIEW" | "REPLIED" | "FAILED";
    received_at: string;
    confidence_score?: number | null;
    classification?: { category: string; confidence_score: number } | null;
    ai_response?: { generated_text: string; dispatch_status: string } | null;
};

export default function ReviewQueuePage() {
    const { data: emails = [], isLoading, refetch } = useGetEmailsQuery({ status: "REVIEW", ordering: "-received_at" });
    const [reviewEmail] = useReviewEmailMutation();
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [draftReply, setDraftReply] = useState("");
    const [toast, setToast] = useState<string | null>(null);

    const queue = emails as LiveEmail[];
    const selected = queue.find((email) => email.id === selectedId) ?? queue[0] ?? null;
    const reply = draftReply || selected?.ai_response?.generated_text || "";

    const showToast = (message: string) => {
        setToast(message);
        window.setTimeout(() => setToast(null), 2500);
    };

    const stats = useMemo(() => {
        return {
            pending: queue.length,
            highPriority: queue.filter((email) => (email.confidence_score ?? 0) < 75).length,
        };
    }, [queue]);

    const handleAction = async (review_status: "APPROVED" | "REJECTED" | "EDITED", send_after_review: boolean) => {
        if (!selected) return;
        await reviewEmail({
            id: selected.id,
            data: {
                corrected_response: reply,
                review_status,
                send_after_review,
                reviewer_comment: review_status === "APPROVED" ? "Approved by reviewer." : "Reviewer action completed.",
            },
        }).unwrap();
        setDraftReply("");
        showToast(review_status === "APPROVED" ? "Reply approved and sent." : "Reviewer update saved.");
        refetch();
    };

    const removeSelected = () => {
        setSelectedId((current) => {
            const remaining = queue.filter((email) => email.id !== current);
            return remaining[0]?.id ?? null;
        });
        setDraftReply("");
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            {toast && (
                <div className="fixed top-5 right-5 z-50 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg">
                    {toast}
                </div>
            )}

            <div className="mx-auto max-w-7xl space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm font-medium text-slate-500">Pending Review</p>
                        <p className="mt-2 text-3xl font-bold text-slate-900">{stats.pending}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm font-medium text-slate-500">Low Confidence</p>
                        <p className="mt-2 text-3xl font-bold text-slate-900">{stats.highPriority}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm font-medium text-slate-500">Workflow</p>
                        <p className="mt-2 text-3xl font-bold text-slate-900">Live</p>
                    </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
                    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                            <div>
                                <h2 className="text-base font-semibold text-slate-900">Review Queue</h2>
                                <p className="text-xs text-slate-500">{queue.length} live records</p>
                            </div>
                            <button onClick={() => refetch()} className="rounded-full p-2 text-slate-500 hover:bg-slate-100" aria-label="Refresh">
                                <RefreshCw size={16} />
                            </button>
                        </div>
                        <div className="max-h-[760px] overflow-y-auto divide-y divide-slate-100">
                            {queue.length === 0 ? (
                                <div className="px-6 py-12 text-center text-sm text-slate-500">No emails need review right now.</div>
                            ) : (
                                queue.map((email) => (
                                    <button
                                        key={email.id}
                                        onClick={() => {
                                            setSelectedId(email.id);
                                            setDraftReply("");
                                        }}
                                        className={`block w-full px-5 py-4 text-left transition-colors ${selected?.id === email.id ? "bg-indigo-50" : "hover:bg-slate-50"}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-slate-400">#{email.id}</span>
                                            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                                                {(email.confidence_score ?? 0).toFixed(0)}%
                                            </span>
                                        </div>
                                        <p className="mt-1.5 truncate text-sm font-semibold text-slate-900">{email.subject}</p>
                                        <p className="truncate text-xs text-slate-500">{email.sender_email}</p>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="flex min-h-[720px] flex-col rounded-3xl border border-slate-200 bg-white shadow-sm">
                        {!selected ? (
                            <div className="flex flex-1 items-center justify-center text-sm text-slate-400">Select an email to review.</div>
                        ) : (
                            <>
                                <div className="border-b border-slate-100 px-6 py-5">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h1 className="text-xl font-bold text-slate-900">{selected.subject}</h1>
                                            <p className="mt-1 text-sm text-slate-500">
                                                {selected.sender_name || selected.sender_email} · {selected.classification?.category ?? "Unclassified"}
                                            </p>
                                        </div>
                                        <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                                            {selected.confidence_score ? `${Math.round(selected.confidence_score)}%` : "N/A"}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                                        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Original Email</p>
                                        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-700">{selected.body}</p>
                                    </div>

                                    <div>
                                        <div className="mb-2 flex items-center gap-2">
                                            <AlertTriangle size={14} className="text-amber-600" />
                                            <p className="text-xs font-semibold uppercase tracking-widest text-amber-600">Reviewer Reply</p>
                                        </div>
                                        <textarea
                                            value={reply}
                                            onChange={(e) => setDraftReply(e.target.value)}
                                            rows={12}
                                            className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-relaxed text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-6 py-5">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <button
                                            onClick={() => handleAction("APPROVED", true)}
                                            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
                                        >
                                            <Check size={15} />
                                            Approve & Send
                                        </button>
                                        <button
                                            onClick={() => handleAction("EDITED", false)}
                                            className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                                        >
                                            <Check size={15} />
                                            Save Correction
                                        </button>
                                        <button
                                            onClick={() => handleAction("REJECTED", false)}
                                            className="inline-flex items-center gap-2 rounded-full border border-rose-200 px-5 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-50"
                                        >
                                            <X size={15} />
                                            Reject
                                        </button>
                                    </div>

                                    <button
                                        onClick={removeSelected}
                                        className="text-sm font-semibold text-slate-500 hover:text-slate-700"
                                    >
                                        Skip for now
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
