"use client";

import { useState } from "react";

type Priority = "high" | "medium" | "low";
type Category = "General Admin" | "Exam & Results" | "Fee & Payment" | "Admissions";

interface QueueItem {
    id: number;
    ticketId: string;
    subject: string;
    priority: Priority;
    email: string;
    category: Category;
    confidence: number;
    waitTime: string;
    originalBody: string;
    aiReply: string;
}

const initialQueue: QueueItem[] = [
    {
        id: 1,
        ticketId: "#1848",
        subject: "Requesting transcript for visa application",
        priority: "high",
        email: "m.uwase@student.uok.ac.rw",
        category: "General Admin",
        confidence: 72,
        waitTime: "2h 14m ago",
        originalBody:
            "I need to request an official transcript urgently for my visa application to study abroad. The consulate requires it within 10 days. Please advise on the fastest way to get this processed.",
        aiReply:
            "Dear Student,\n\nThank you for reaching out to the University of Kigali regarding your transcript request for a visa application.\n\nPlease submit Form TRN-02 available at the Registrar's window or on the student portal. Processing takes 3–5 business days. A fee of RWF 5,000 applies.\n\nKind regards,\nUoK Registrar's Office",
    },
    {
        id: 2,
        ticketId: "#1843",
        subject: "Scholarship appeal process",
        priority: "high",
        email: "r.habimana@student.uok.ac.rw",
        category: "General Admin",
        confidence: 58,
        waitTime: "4h 01m ago",
        originalBody:
            "I was informed that my scholarship has been suspended due to GPA requirements. I believe there were extenuating circumstances this semester due to a family emergency. I would like to know the process for appealing this decision.",
        aiReply:
            "Dear Student,\n\nThank you for contacting the University of Kigali.\n\nTo appeal a scholarship suspension, please complete the Scholarship Appeal Form (SCH-AP-01) available from the Student Finance office. You will need to provide supporting documentation for any extenuating circumstances.\n\nAppeals are reviewed by the Scholarship Committee within 10 working days of submission.\n\nKind regards,\nUoK Student Finance Office",
    },
    {
        id: 3,
        ticketId: "#1839",
        subject: "Medical deferral for exam",
        priority: "medium",
        email: "p.niyonsaba@student.uok.ac.rw",
        category: "Exam & Results",
        confidence: 67,
        waitTime: "5h 30m ago",
        originalBody:
            "I was unable to sit my final examination last week due to a medical emergency. I was hospitalized and have a medical certificate from the doctor. Can I apply for a deferred exam?",
        aiReply:
            "Dear Student,\n\nThank you for reaching out to the Examinations Office.\n\nYes, you may apply for a medical deferral. Please submit your completed Deferral Request Form (EX-DEF-02) along with your original medical certificate to the Examinations Office within 5 days of the missed exam.\n\nYour request will be reviewed by the Academic Board.\n\nKind regards,\nUoK Examinations Office",
    },
    {
        id: 4,
        ticketId: "#1831",
        subject: "Refund request after withdrawal",
        priority: "medium",
        email: "d.mukandori@student.uok.ac.rw",
        category: "Fee & Payment",
        confidence: 61,
        waitTime: "7h 12m ago",
        originalBody:
            "I officially withdrew from the university last month and was told I may be eligible for a partial tuition refund. I have not received any communication about this. Please let me know the status and process.",
        aiReply:
            "Dear Student,\n\nThank you for contacting the University of Kigali Finance Department.\n\nRefunds following withdrawal are processed according to our Refund Policy. Eligibility depends on the date of withdrawal relative to the semester start date.\n\nPlease submit your Refund Request Form (FIN-REF-01) with your withdrawal confirmation to the Finance Office. Processing takes 15–20 business days.\n\nKind regards,\nUoK Finance Office",
    },
];

const priorityConfig: Record<Priority, { label: string; textClass: string; badgeClass: string; borderClass: string }> = {
    high: {
        label: "high priority",
        textClass: "text-red-500",
        badgeClass: "bg-red-50 text-red-500 border border-red-200",
        borderClass: "border-l-amber-400",
    },
    medium: {
        label: "medium priority",
        textClass: "text-amber-500",
        badgeClass: "bg-amber-50 text-amber-500 border border-amber-200",
        borderClass: "border-l-amber-300",
    },
    low: {
        label: "low priority",
        textClass: "text-green-500",
        badgeClass: "bg-green-50 text-green-500 border border-green-200",
        borderClass: "border-l-green-300",
    },
};

const confidenceColor = (val: number) => {
    if (val >= 70) return "text-green-600 bg-green-50 border-green-200";
    if (val >= 55) return "text-amber-500 bg-amber-50 border-amber-200";
    return "text-red-500 bg-red-50 border-red-200";
};

export default function ReviewPage() {
    const [queue, setQueue] = useState(initialQueue);
    const [selectedId, setSelectedId] = useState<number>(1);
    const [editedReplies, setEditedReplies] = useState<Record<number, string>>({});
    const [toast, setToast] = useState<{ message: string; color: string } | null>(null);

    const selected = queue.find((i) => i.id === selectedId)!;
    const reply = editedReplies[selectedId] ?? selected?.aiReply ?? "";

    const showToast = (message: string, color: string) => {
        setToast({ message, color });
        setTimeout(() => setToast(null), 3000);
    };

    const removeItem = (id: number) => {
        const remaining = queue.filter((i) => i.id !== id);
        setQueue(remaining);
        if (remaining.length > 0) setSelectedId(remaining[0].id);
    };

    const handleApprove = () => {
        showToast(`✓ Reply sent to ${selected.email}`, "bg-green-600");
        removeItem(selectedId);
    };

    const handleCorrection = () => {
        showToast("✎ Correction submitted for review", "bg-indigo-600");
        removeItem(selectedId);
    };

    const handleReject = () => {
        showToast("✕ Email rejected and removed from queue", "bg-red-500");
        removeItem(selectedId);
    };

    if (queue.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-1">Queue cleared!</h2>
                    <p className="text-gray-400 text-sm">All emails have been reviewed.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans flex items-start justify-center p-6">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-5 right-5 z-50 ${toast.color} text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg transition-all`}>
                    {toast.message}
                </div>
            )}

            <div className="w-full max-w-6xl flex gap-4 h-[calc(100vh-3rem)]">

                {/* LEFT: Queue Sidebar */}
                <div className="w-72 shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100">
                        <h2 className="text-base font-semibold text-gray-900">Queue ({queue.length})</h2>
                    </div>
                    <ul className="overflow-y-auto flex-1 divide-y divide-gray-100">
                        {queue.map((item) => {
                            const pc = priorityConfig[item.priority];
                            const isActive = item.id === selectedId;
                            return (
                                <li
                                    key={item.id}
                                    onClick={() => setSelectedId(item.id)}
                                    className={`cursor-pointer px-4 py-3.5 border-l-4 transition-colors ${pc.borderClass} ${isActive ? "bg-amber-50" : "hover:bg-gray-50"
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs text-gray-400 font-medium">{item.ticketId}</span>
                                        <span className={`text-xs font-bold border px-1.5 py-0.5 rounded ${confidenceColor(item.confidence)}`}>
                                            {item.confidence}%
                                        </span>
                                    </div>
                                    <p className="text-sm font-medium text-gray-800 leading-snug">{item.subject}</p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {item.waitTime} ·{" "}
                                        <span className={`font-medium ${pc.textClass}`}>{pc.label}</span>
                                    </p>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                {/* RIGHT: Review Panel */}
                {selected && (
                    <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between">
                            <div>
                                <h1 className="text-base font-semibold text-gray-900">{selected.subject}</h1>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    From: {selected.email} · Intent: {selected.category}
                                </p>
                            </div>
                            <span className={`text-sm font-bold border px-2 py-0.5 rounded ${confidenceColor(selected.confidence)}`}>
                                {selected.confidence}%
                            </span>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                            {/* Original Email */}
                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                                <p className="text-xs font-semibold text-gray-400 tracking-widest uppercase mb-2">
                                    Original Email Body
                                </p>
                                <p className="text-sm text-gray-700 leading-relaxed">{selected.originalBody}</p>
                            </div>

                            {/* AI Reply Editor */}
                            <div>
                                <div className="flex items-center gap-1.5 mb-2">
                                    <svg className="w-3.5 h-3.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                    <p className="text-xs font-semibold text-amber-500 tracking-widest uppercase">
                                        Edit AI Reply Before Approving
                                    </p>
                                </div>
                                <textarea
                                    className="w-full h-72 border border-gray-200 rounded-xl p-4 text-sm text-gray-700 font-mono leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent bg-white"
                                    value={reply}
                                    onChange={(e) =>
                                        setEditedReplies((prev) => ({ ...prev, [selectedId]: e.target.value }))
                                    }
                                />
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="px-6 py-4 border-t border-gray-100 flex items-center gap-3">
                            <button
                                onClick={handleApprove}
                                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 active:scale-95 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-all"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Approve &amp; Send
                            </button>

                            <button
                                onClick={handleCorrection}
                                className="flex items-center gap-2 border border-gray-200 hover:bg-gray-50 active:scale-95 text-gray-600 text-sm font-semibold px-5 py-2.5 rounded-full transition-all"
                            >
                                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Submit Correction
                            </button>

                            <button
                                onClick={handleReject}
                                className="flex items-center gap-2 border border-red-100 hover:bg-red-50 active:scale-95 text-red-500 text-sm font-semibold px-5 py-2.5 rounded-full transition-all"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Reject
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}