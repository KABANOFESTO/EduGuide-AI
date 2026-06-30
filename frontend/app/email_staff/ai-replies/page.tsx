"use client";

import { useMemo, useState } from "react";
import { Bot, RefreshCw, Send } from "lucide-react";

import { useGetEmailsQuery, useSendEmailReplyMutation } from "@/lib/redux/silces/EmailSlice";

type ReplyStatus = "DRAFT" | "QUEUED" | "SENT" | "FAILED";

type LiveReply = {
    id: number;
    subject: string;
    sender_email: string;
    status: string;
    confidence_score?: number | null;
    classification?: { category: string; confidence_score: number } | null;
    ai_response?: {
        id: number;
        generated_text: string;
        dispatch_status: ReplyStatus;
        approved: boolean;
        dispatched_at?: string | null;
    } | null;
};

export default function AIRepliesPage() {
    const { data: emails = [], isLoading, refetch } = useGetEmailsQuery({ ordering: "-received_at" });
    const [sendReply] = useSendEmailReplyMutation();
    const [filter, setFilter] = useState<"All" | ReplyStatus>("All");
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [toast, setToast] = useState<string | null>(null);

    const replies = emails as LiveReply[];
    const selected = replies.find((item) => item.id === selectedId) ?? replies[0] ?? null;

    const filtered = useMemo(() => {
        if (filter === "All") return replies;
        return replies.filter((item) => item.ai_response?.dispatch_status === filter);
    }, [filter, replies]);

    const showToast = (message: string) => {
        setToast(message);
        window.setTimeout(() => setToast(null), 2200);
    };

    const dispatchSelected = async () => {
        if (!selected) return;
        await sendReply(selected.id).unwrap();
        showToast("Reply dispatched.");
        refetch();
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
                            <h2 className="text-base font-semibold text-slate-900">AI Replies</h2>
                            <p className="text-xs text-slate-500">Live responses from backend.</p>
                        </div>
                        <button onClick={() => refetch()} className="rounded-full p-2 text-slate-500 hover:bg-slate-100" aria-label="Refresh">
                            <RefreshCw size={16} />
                        </button>
                    </div>
                    <div className="border-b border-slate-100 px-5 py-3">
                        <div className="flex flex-wrap gap-2">
                            {(["All", "DRAFT", "QUEUED", "SENT", "FAILED"] as const).map((option) => (
                                <button
                                    key={option}
                                    onClick={() => setFilter(option)}
                                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${filter === option ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"}`}
                                >
                                    {option === "All" ? "All" : option}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="max-h-[720px] overflow-y-auto divide-y divide-slate-100">
                        {isLoading ? (
                            <div className="px-6 py-12 text-center text-sm text-slate-500">Loading replies...</div>
                        ) : filtered.length === 0 ? (
                            <div className="px-6 py-12 text-center text-sm text-slate-500">No replies match this filter.</div>
                        ) : (
                            filtered.map((reply) => (
                                <button
                                    key={reply.id}
                                    onClick={() => setSelectedId(reply.id)}
                                    className={`block w-full px-5 py-4 text-left transition-colors ${selected?.id === reply.id ? "bg-indigo-50" : "hover:bg-slate-50"}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-slate-400">#{reply.id}</span>
                                        <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                                            {Math.round(reply.classification?.confidence_score ?? reply.confidence_score ?? 0)}%
                                        </span>
                                    </div>
                                    <p className="mt-1.5 truncate text-sm font-semibold text-slate-900">{reply.subject}</p>
                                    <p className="truncate text-xs text-slate-500">{reply.sender_email}</p>
                                    <div className="mt-2 flex items-center gap-2">
                                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                                            {reply.ai_response?.dispatch_status ?? "DRAFT"}
                                        </span>
                                        <span className="truncate text-xs text-slate-400">{reply.classification?.category ?? "Unclassified"}</span>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                <div className="flex min-h-[620px] flex-col rounded-3xl border border-slate-200 bg-white shadow-sm">
                    {!selected ? (
                        <div className="flex flex-1 items-center justify-center text-sm text-slate-400">Select a reply to view details.</div>
                    ) : (
                        <>
                            <div className="border-b border-slate-100 px-6 py-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h1 className="text-xl font-bold text-slate-900">{selected.subject}</h1>
                                        <p className="mt-1 text-sm text-slate-500">{selected.sender_email} · {selected.classification?.category ?? "Unclassified"}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Bot className="text-indigo-600" size={18} />
                                        <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                                            {selected.ai_response?.dispatch_status ?? "DRAFT"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">AI Generated Reply</p>
                                    <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-700">
                                        {selected.ai_response?.generated_text ?? "No AI response available yet."}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between gap-4 border-t border-slate-100 px-6 py-5">
                                <div className="text-sm text-slate-500">
                                    Confidence: {Math.round(selected.classification?.confidence_score ?? selected.confidence_score ?? 0)}%
                                </div>
                                <button
                                    onClick={dispatchSelected}
                                    className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
                                >
                                    <Send size={15} />
                                    Dispatch
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
