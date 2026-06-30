"use client";

import { useMemo } from "react";
import { MessageSquare, ThumbsDown, ThumbsUp } from "lucide-react";

import { useGetEmailsQuery } from "@/lib/redux/silces/EmailSlice";

type FeedbackRecord = {
    rating: number;
    comment?: string;
    created_at: string;
    email: {
        id: number;
        subject: string;
        sender_email: string;
    };
};

export default function MyFeedbackPage() {
    const { data: emails = [] } = useGetEmailsQuery({ ordering: "-received_at" });

    const feedback = useMemo(() => {
        const records: FeedbackRecord[] = [];
        (emails as Array<{ id: number; subject: string; sender_email: string; feedback?: Array<{ rating: number; comment?: string; created_at: string }> }>).forEach((email) => {
            (email.feedback ?? []).forEach((item) => {
                records.push({
                    ...item,
                    email: {
                        id: email.id,
                        subject: email.subject,
                        sender_email: email.sender_email,
                    },
                });
            });
        });
        return records.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }, [emails]);

    const positiveCount = feedback.filter((f) => f.rating >= 4).length;
    const negativeCount = feedback.filter((f) => f.rating <= 2).length;

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="mx-auto max-w-6xl space-y-6">
                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <ThumbsUp className="text-emerald-600" size={18} />
                        <p className="mt-4 text-3xl font-extrabold text-slate-900">{positiveCount}</p>
                        <p className="text-sm font-semibold text-slate-700">Positive Ratings</p>
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <ThumbsDown className="text-rose-600" size={18} />
                        <p className="mt-4 text-3xl font-extrabold text-slate-900">{negativeCount}</p>
                        <p className="text-sm font-semibold text-slate-700">Negative Ratings</p>
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <MessageSquare className="text-indigo-600" size={18} />
                        <p className="mt-4 text-3xl font-extrabold text-slate-900">{feedback.length}</p>
                        <p className="text-sm font-semibold text-slate-700">Total Feedback</p>
                    </div>
                </div>

                <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 px-6 py-5">
                        <h2 className="text-base font-semibold text-slate-900">Feedback History</h2>
                        <p className="text-sm text-slate-500">Pulled from live email feedback records.</p>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {feedback.length === 0 ? (
                            <div className="px-6 py-10 text-center text-sm text-slate-400">
                                No feedback has been recorded yet.
                            </div>
                        ) : (
                            feedback.map((entry) => (
                                <div key={`${entry.email.id}-${entry.created_at}`} className="flex items-start gap-4 px-6 py-4">
                                    <div className={`flex h-9 w-9 items-center justify-center rounded-full ${entry.rating >= 4 ? "bg-emerald-50" : "bg-rose-50"}`}>
                                        {entry.rating >= 4 ? <ThumbsUp size={15} className="text-emerald-600" /> : <ThumbsDown size={15} className="text-rose-600" />}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-semibold text-slate-900">{entry.email.subject}</p>
                                            <span className="text-xs font-medium text-slate-400">{entry.email.sender_email}</span>
                                        </div>
                                        <p className="mt-0.5 text-sm text-slate-600">{entry.comment || "No comment supplied."}</p>
                                        <p className="mt-1 text-xs text-slate-400">
                                            Rating: {entry.rating}/5 · {new Date(entry.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
