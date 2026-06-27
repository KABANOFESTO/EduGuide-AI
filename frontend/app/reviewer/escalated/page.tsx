"use client";

import { useState } from "react";

type Priority = "high" | "medium" | "low";
type EscalatedBy = "Staff" | "System";

interface EscalatedEmail {
    id: number;
    ticketId: string;
    subject: string;
    priority: Priority;
    email: string;
    category: string;
    confidence: number;
    escalatedBy: EscalatedBy;
    waitTime: string;
}

const initialEmails: EscalatedEmail[] = [
    {
        id: 1,
        ticketId: "#1848",
        subject: "Requesting transcript for visa application",
        priority: "high",
        email: "m.uwase@student.uok.ac.rw",
        category: "General Admin",
        confidence: 72,
        escalatedBy: "Staff",
        waitTime: "2h 14m ago",
    },
    {
        id: 2,
        ticketId: "#1837",
        subject: "Legal dispute over grade result",
        priority: "high",
        email: "r.habimana@student.uok.ac.rw",
        category: "Exam & Results",
        confidence: 43,
        escalatedBy: "System",
        waitTime: "5h 30m ago",
    },
    {
        id: 3,
        ticketId: "#1822",
        subject: "Request for investigation into finance error",
        priority: "medium",
        email: "d.mukandori@student.uok.ac.rw",
        category: "Fee & Payment",
        confidence: 55,
        escalatedBy: "Staff",
        waitTime: "8h 02m ago",
    },
];

const priorityConfig: Record<Priority, { label: string; badgeClass: string; iconColor: string; ringColor: string }> = {
    high: {
        label: "high priority",
        badgeClass: "bg-red-50 text-red-500 border border-red-200",
        iconColor: "text-red-500",
        ringColor: "bg-red-50 border-red-200",
    },
    medium: {
        label: "medium priority",
        badgeClass: "bg-amber-50 text-amber-500 border border-amber-200",
        iconColor: "text-amber-500",
        ringColor: "bg-amber-50 border-amber-200",
    },
    low: {
        label: "low priority",
        badgeClass: "bg-green-50 text-green-500 border border-green-200",
        iconColor: "text-green-500",
        ringColor: "bg-green-50 border-green-200",
    },
};

const confidenceColor = (val: number) => {
    if (val >= 70) return "bg-green-50 text-green-600 border-green-200";
    if (val >= 55) return "bg-amber-50 text-amber-500 border-amber-200";
    return "bg-red-50 text-red-500 border-red-200";
};

export default function EscalatedPage() {
    const [emails, setEmails] = useState(initialEmails);
    const [toast, setToast] = useState<{ message: string; color: string } | null>(null);
    const [reassignId, setReassignId] = useState<number | null>(null);

    const showToast = (message: string, color: string) => {
        setToast({ message, color });
        setTimeout(() => setToast(null), 3000);
    };

    const handleReview = (id: number) => {
        showToast("Opening review panel…", "bg-indigo-700");
    };

    const handleReassign = (id: number) => {
        setReassignId(id);
    };

    const confirmReassign = (id: number, dept: string) => {
        setEmails((prev) => prev.filter((e) => e.id !== id));
        setReassignId(null);
        showToast(`✓ Reassigned to ${dept}`, "bg-indigo-600");
    };

    const departments = ["Registrar's Office", "Student Finance", "Academic Affairs", "IT Support"];

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <div className="max-w-6xl mx-auto px-6 py-8 space-y-5">

                {/* Toast */}
                {toast && (
                    <div className={`fixed top-5 right-5 z-50 ${toast.color} text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg`}>
                        {toast.message}
                    </div>
                )}

                {/* Warning Banner */}
                <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex gap-3 items-start">
                    <svg className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    </svg>
                    <div>
                        <p className="text-sm font-semibold text-amber-700">Escalated emails need your attention</p>
                        <p className="text-xs text-amber-600 mt-0.5">
                            These emails were flagged either because AI confidence was too low or staff manually escalated them. Review and respond appropriately.
                        </p>
                    </div>
                </div>

                {/* Email Cards */}
                {emails.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                        <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <p className="text-sm font-semibold text-gray-700">All escalated emails resolved</p>
                        <p className="text-xs text-gray-400 mt-1">No items require your attention right now.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {emails.map((item) => {
                            const pc = priorityConfig[item.priority];
                            return (
                                <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-4">
                                    {/* Icon */}
                                    <div className={`w-10 h-10 rounded-full border flex items-center justify-center shrink-0 ${pc.ringColor}`}>
                                        <svg className={`w-5 h-5 ${pc.iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                        </svg>
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-sm font-semibold text-gray-900">{item.subject}</span>
                                            <span className="text-xs text-gray-400 font-medium">{item.ticketId}</span>
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${pc.badgeClass}`}>
                                                {pc.label}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {item.email} · <span className="text-indigo-400">{item.category}</span>
                                        </p>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <span className={`text-xs font-semibold border px-1.5 py-0.5 rounded ${confidenceColor(item.confidence)}`}>
                                                {item.confidence}%
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                Escalated by: <span className="font-medium text-gray-500">{item.escalatedBy}</span>
                                            </span>
                                            <span className="text-xs text-gray-400">{item.waitTime}</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 shrink-0 relative">
                                        <button
                                            onClick={() => handleReview(item.id)}
                                            className="bg-indigo-700 hover:bg-indigo-800 active:scale-95 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-all"
                                        >
                                            Review
                                        </button>
                                        <button
                                            onClick={() => handleReassign(item.id)}
                                            className="border border-gray-200 hover:bg-gray-50 active:scale-95 text-gray-600 text-sm font-semibold px-4 py-2 rounded-xl transition-all"
                                        >
                                            Reassign
                                        </button>

                                        {/* Reassign dropdown */}
                                        {reassignId === item.id && (
                                            <div className="absolute right-0 top-11 z-10 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 w-52">
                                                <p className="text-xs text-gray-400 font-semibold px-3 pb-1.5 pt-0.5 uppercase tracking-widest">Reassign to</p>
                                                {departments.map((dept) => (
                                                    <button
                                                        key={dept}
                                                        onClick={() => confirmReassign(item.id, dept)}
                                                        className="w-full text-left text-sm text-gray-700 hover:bg-gray-50 px-3 py-2 transition-colors"
                                                    >
                                                        {dept}
                                                    </button>
                                                ))}
                                                <button
                                                    onClick={() => setReassignId(null)}
                                                    className="w-full text-left text-sm text-gray-400 hover:bg-gray-50 px-3 py-2 border-t border-gray-100 mt-1 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}