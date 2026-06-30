"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Check, Filter, Loader2, RefreshCw, Send, Star } from "lucide-react";

import {
    useEscalateEmailMutation,
    useGetEmailsQuery,
    useSendEmailReplyMutation,
    useSubmitEmailFeedbackMutation,
} from "@/lib/redux/silces/EmailSlice";

type BackendEmail = {
    id: number;
    sender_name: string;
    sender_email: string;
    subject: string;
    body: string;
    status: "PENDING" | "PROCESSED" | "REVIEW" | "REPLIED" | "FAILED";
    confidence_score?: number | null;
    received_at: string;
    classification?: {
        category: string;
        confidence_score: number;
    } | null;
    ai_response?: {
        generated_text: string;
        dispatch_status: string;
        approved: boolean;
    } | null;
    review?: {
        corrected_response: string;
        review_status: string;
    } | null;
    feedback?: Array<{ rating: number; comment?: string; created_at: string }> | null;
};

type FilterStatus = "All" | BackendEmail["status"];

function badgeForStatus(status: BackendEmail["status"]) {
    switch (status) {
        case "REPLIED":
            return "bg-emerald-50 text-emerald-700";
        case "REVIEW":
            return "bg-amber-50 text-amber-700";
        case "FAILED":
            return "bg-rose-50 text-rose-700";
        case "PROCESSED":
            return "bg-indigo-50 text-indigo-700";
        default:
            return "bg-slate-100 text-slate-600";
    }
}

function displayStatus(status: BackendEmail["status"], autoDispatch?: boolean) {
    if (status === "REVIEW") return "Escalated";
    if (status === "REPLIED" && autoDispatch) return "Auto-Sent";
    if (status === "REPLIED") return "Approved";
    if (status === "PROCESSED") return "Processed";
    if (status === "FAILED") return "Failed";
    return "Pending";
}

function Confidence({ value }: { value: number }) {
    return (
        <span className="rounded-full bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white">
            {Math.round(value)}%
        </span>
    );
}

export default function EmailInboxPage() {
    const { data: emails = [], isLoading, isError, refetch } = useGetEmailsQuery({ ordering: "-received_at" });
    const [sendReply] = useSendEmailReplyMutation();
    const [escalateEmail] = useEscalateEmailMutation();
    const [submitFeedback] = useSubmitEmailFeedbackMutation();
    const [filter, setFilter] = useState<FilterStatus>("All");
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [toast, setToast] = useState<string | null>(null);
    const [feedbackLoading, setFeedbackLoading] = useState(false);

    const liveEmails = emails as BackendEmail[];

    const filtered = useMemo(() => {
        return filter === "All" ? liveEmails : liveEmails.filter((email) => email.status === filter);
    }, [filter, liveEmails]);

    const selected = filtered.find((email) => email.id === selectedId) ?? filtered[0] ?? null;

    const showToast = (message: string) => {
        setToast(message);
        window.setTimeout(() => setToast(null), 2200);
    };

    const handleApprove = async () => {
        if (!selected) return;
        await sendReply(selected.id).unwrap();
        showToast("Email dispatched successfully.");
        refetch();
    };

    const handleEscalate = async () => {
        if (!selected) return;
        await escalateEmail(selected.id).unwrap();
        showToast("Email escalated to reviewer queue.");
        refetch();
    };

    const handleFeedback = async (rating: number) => {
        if (!selected) return;
        setFeedbackLoading(true);
        try {
            await submitFeedback({
                id: selected.id,
                data: {
                    email_id: selected.id,
                    rating,
                    comment: rating >= 4 ? "Positive operational outcome." : "Needs attention.",
                    feedback_source: "staff",
                },
            }).unwrap();
            showToast("Feedback recorded.");
            refetch();
        } finally {
            setFeedbackLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            {toast && (
                <div className="fixed bottom-6 right-6 z-50 rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-lg">
                    {toast}
                </div>
            )}

            <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
                <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                        <div>
                            <h2 className="text-base font-semibold text-slate-900">Inbox</h2>
                            <p className="text-xs text-slate-500">Live emails from the backend</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => refetch()}
                                className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
                                aria-label="Refresh"
                            >
                                <RefreshCw size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="border-b border-slate-100 px-5 py-3">
                        <div className="flex flex-wrap gap-2">
                            {(["All", "PENDING", "PROCESSED", "REVIEW", "REPLIED", "FAILED"] as const).map((value) => (
                                <button
                                    key={value}
                                    onClick={() => setFilter(value)}
                                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${filter === value ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"}`}
                                >
                                    {value === "All" ? "All" : displayStatus(value, false)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="max-h-[720px] overflow-y-auto">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-16 text-slate-500">
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Loading emails...
                            </div>
                        ) : isError ? (
                            <div className="px-6 py-16 text-center text-sm text-rose-600">
                                Failed to load inbox.
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="px-6 py-16 text-center text-sm text-slate-500">
                                No emails match this filter.
                            </div>
                        ) : (
                            filtered.map((email) => (
                                <button
                                    key={email.id}
                                    onClick={() => setSelectedId(email.id)}
                                    className={`block w-full border-b border-slate-100 px-5 py-4 text-left transition-colors ${selected?.id === email.id ? "bg-indigo-50" : "hover:bg-slate-50"}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs font-medium text-slate-400">#{email.id}</p>
                                        <Confidence value={email.classification?.confidence_score ?? email.confidence_score ?? 0} />
                                    </div>
                                    <p className="mt-1.5 truncate text-sm font-semibold text-slate-900">{email.subject}</p>
                                    <p className="truncate text-xs text-slate-500">{email.sender_email}</p>
                                    <div className="mt-2">
                                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badgeForStatus(email.status)}`}>
                                            {displayStatus(email.status, Boolean(email.ai_response?.dispatch_status === "SENT" && email.status === "REPLIED"))}
                                        </span>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                <div className="flex min-h-[620px] flex-col rounded-3xl border border-slate-200 bg-white shadow-sm">
                    {!selected ? (
                        <div className="flex flex-1 items-center justify-center text-sm text-slate-400">
                            Select an email to view details.
                        </div>
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
                                    <div className="flex flex-col items-end gap-2">
                                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeForStatus(selected.status)}`}>
                                            {displayStatus(selected.status, Boolean(selected.ai_response?.dispatch_status === "SENT" && selected.status === "REPLIED"))}
                                        </span>
                                        <Confidence value={selected.classification?.confidence_score ?? selected.confidence_score ?? 0} />
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Original Message</p>
                                    <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-700">{selected.body}</p>
                                </div>

                                <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5">
                                    <div className="flex items-center gap-2">
                                        <Send size={14} className="text-indigo-600" />
                                        <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">AI Response</p>
                                    </div>
                                    <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-800">
                                        {selected.ai_response?.generated_text ?? "No AI response generated yet."}
                                    </p>
                                </div>

                                {selected.feedback?.length ? (
                                    <div className="rounded-2xl border border-slate-200 bg-white p-5">
                                        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Latest Feedback</p>
                                        <div className="mt-3 space-y-2">
                                            {selected.feedback.map((item, index) => (
                                                <div key={index} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm">
                                                    <div className="flex items-center gap-2 text-slate-700">
                                                        <Star size={14} className="text-amber-500" />
                                                        <span>{item.comment || "Staff feedback"}</span>
                                                    </div>
                                                    <span className="text-slate-500">{item.rating}/5</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : null}
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 px-6 py-5">
                                <div className="flex flex-wrap items-center gap-3">
                                    <button
                                        onClick={handleApprove}
                                        className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
                                    >
                                        <Check size={15} />
                                        Dispatch Reply
                                    </button>
                                    <button
                                        onClick={handleEscalate}
                                        className="inline-flex items-center gap-2 rounded-full bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-700"
                                    >
                                        <AlertTriangle size={15} />
                                        Escalate
                                    </button>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        disabled={feedbackLoading}
                                        onClick={() => handleFeedback(5)}
                                        className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                                    >
                                        Rate 5
                                    </button>
                                    <button
                                        disabled={feedbackLoading}
                                        onClick={() => handleFeedback(3)}
                                        className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                                    >
                                        Rate 3
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
