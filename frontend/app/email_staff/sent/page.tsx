"use client";

import { useMemo } from "react";
import { Download } from "lucide-react";

import { useGetEmailDispatchLogsQuery } from "@/lib/redux/silces/EmailSlice";

type DispatchRow = {
    email: {
        id: number;
        sender_email: string;
        subject: string;
    };
    response?: {
        dispatch_status: string;
        confidence_score?: number;
    } | null;
    status: string;
    attempted_at: string;
    details?: Record<string, unknown>;
};

function exportToCSV(rows: DispatchRow[]) {
    const header = ["Email ID", "Recipient", "Subject", "Status", "Attempted At"];
    const body = rows.map((row) => [
        row.email.id,
        row.email.sender_email,
        row.email.subject,
        row.status,
        row.attempted_at,
    ]);
    const csv = [header, ...body]
        .map((line) => line.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
        .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sent-emails-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

export default function SentEmailsPage() {
    const { data: logs = [] } = useGetEmailDispatchLogsQuery({ ordering: "-attempted_at" });
    const rows = logs as DispatchRow[];

    const stats = useMemo(() => {
        const sent = rows.filter((row) => row.status === "SENT").length;
        const queued = rows.filter((row) => row.status === "QUEUED").length;
        const failed = rows.filter((row) => row.status === "FAILED").length;
        return { sent, queued, failed, total: rows.length };
    }, [rows]);

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="mx-auto max-w-6xl space-y-6">
                <div className="grid gap-4 sm:grid-cols-4">
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <p className="text-sm font-medium text-slate-500">Total</p>
                        <p className="mt-2 text-3xl font-bold text-slate-900">{stats.total}</p>
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <p className="text-sm font-medium text-slate-500">Sent</p>
                        <p className="mt-2 text-3xl font-bold text-emerald-600">{stats.sent}</p>
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <p className="text-sm font-medium text-slate-500">Queued</p>
                        <p className="mt-2 text-3xl font-bold text-amber-600">{stats.queued}</p>
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <p className="text-sm font-medium text-slate-500">Failed</p>
                        <p className="mt-2 text-3xl font-bold text-rose-600">{stats.failed}</p>
                    </div>
                </div>

                <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                        <div>
                            <h1 className="text-base font-semibold text-slate-900">Dispatch Log</h1>
                            <p className="text-sm text-slate-500">Live dispatch outcomes from backend logs.</p>
                        </div>
                        <button
                            onClick={() => exportToCSV(rows)}
                            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                            <Download size={15} />
                            Export
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px] text-left">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Email</th>
                                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Recipient</th>
                                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Subject</th>
                                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Status</th>
                                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Attempted At</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {rows.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-10 text-center text-sm text-slate-400">
                                            No dispatch logs are available yet.
                                        </td>
                                    </tr>
                                ) : (
                                    rows.map((row) => (
                                        <tr key={`${row.email.id}-${row.attempted_at}`}>
                                            <td className="px-6 py-4 text-sm font-medium text-slate-500">#{row.email.id}</td>
                                            <td className="px-6 py-4 text-sm text-slate-700">{row.email.sender_email}</td>
                                            <td className="px-6 py-4 text-sm font-medium text-slate-900">{row.email.subject}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600">{row.status}</td>
                                            <td className="px-6 py-4 text-sm text-slate-500">{new Date(row.attempted_at).toLocaleString()}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </div>
    );
}
