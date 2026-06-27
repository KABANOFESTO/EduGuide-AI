"use client";

import { useState } from "react";

type Status = "Pending" | "Approved" | "Rejected";

interface Correction {
    id: number;
    ticketId: string;
    subject: string;
    time: string;
    status: Status;
    originalReply: string;
    yourCorrection: string;
    issueIdentified: string;
}

const corrections: Correction[] = [
    {
        id: 1,
        ticketId: "#1843",
        subject: "Scholarship appeal process",
        time: "Today 09:01",
        status: "Pending",
        originalReply:
            "Dear student, scholarship appeals must be submitted to the Academic Affairs office within 7 days of the decision.",
        yourCorrection:
            "Dear student, scholarship appeals must be submitted to the Financial Aid office within 10 working days using Form SA-12, available at the Student Affairs desk.",
        issueIdentified: "Wrong office name and deadline",
    },
    {
        id: 2,
        ticketId: "#1831",
        subject: "Refund request after withdrawal",
        time: "Today 07:45",
        status: "Pending",
        originalReply: "Dear student, refund requests are processed within 30 days.",
        yourCorrection:
            "Dear student, tuition refunds are processed within 10 business days of receiving your signed withdrawal form and student ID copy. A 20% administrative fee applies.",
        issueIdentified: "Incomplete policy information",
    },
    {
        id: 3,
        ticketId: "#1819",
        subject: "Deferral request for medical reasons",
        time: "Yesterday 15:30",
        status: "Approved",
        originalReply: "Dear student, please contact the registrar for deferral requests.",
        yourCorrection:
            "Dear student, medical deferrals require a certified medical certificate submitted to the Registrar's Office (Room B204) no later than 5 days before the exam date.",
        issueIdentified: "Missing specific requirements",
    },
];

const stats = [
    {
        icon: (
            <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
        ),
        iconBg: "bg-indigo-50",
        value: 3,
        label: "Corrections Submitted",
    },
    {
        icon: (
            <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        iconBg: "bg-green-50",
        value: 1,
        label: "Applied to Model",
    },
    {
        icon: (
            <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        iconBg: "bg-amber-50",
        value: 2,
        label: "Pending Review",
    },
];

const statusConfig: Record<Status, string> = {
    Pending: "text-amber-500",
    Approved: "text-green-500",
    Rejected: "text-red-500",
};

export default function CorrectionsPage() {
    const [items] = useState(corrections);

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">

                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {stats.map((s, i) => (
                        <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                            <div className={`w-9 h-9 rounded-full ${s.iconBg} flex items-center justify-center mb-4`}>
                                {s.icon}
                            </div>
                            <p className="text-3xl font-bold text-gray-900">{s.value}</p>
                            <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Correction Cards */}
                <div className="space-y-4">
                    {items.map((item) => (
                        <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            {/* Card Header */}
                            <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-sm font-semibold text-gray-900">{item.subject}</h3>
                                        <span className="text-xs text-gray-400 font-medium">{item.ticketId}</span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-0.5">{item.time}</p>
                                </div>
                                <span className={`text-xs font-semibold ${statusConfig[item.status]}`}>
                                    {item.status}
                                </span>
                            </div>

                            {/* Side-by-side comparison */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-6 py-5">
                                {/* Original AI Reply */}
                                <div>
                                    <p className="text-xs font-bold text-red-400 tracking-widest uppercase mb-2">
                                        Original AI Reply
                                    </p>
                                    <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-gray-700 leading-relaxed">
                                        {item.originalReply}
                                    </div>
                                </div>

                                {/* Your Correction */}
                                <div>
                                    <p className="text-xs font-bold text-green-600 tracking-widest uppercase mb-2">
                                        Your Correction
                                    </p>
                                    <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3 text-sm text-gray-700 leading-relaxed">
                                        {item.yourCorrection}
                                    </div>
                                </div>
                            </div>

                            {/* Issue Identified */}
                            <div className="px-6 pb-5">
                                <div className="flex items-center gap-1.5">
                                    <svg className="w-4 h-4 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                    </svg>
                                    <p className="text-xs text-gray-500">
                                        <span className="font-semibold text-amber-500">Issue identified:</span>{" "}
                                        <span className="text-indigo-500">{item.issueIdentified}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}