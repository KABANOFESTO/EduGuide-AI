"use client";

import { useState } from "react";

type Priority = "high" | "medium" | "low";
type Category = "General Admin" | "Exam & Results" | "Fee & Payment" | "Admissions";

interface QueueItem {
    id: number;
    subject: string;
    priority: Priority;
    email: string;
    category: Category;
    confidence: number;
    waitTime: string;
}

const queueItems: QueueItem[] = [
    {
        id: 1,
        subject: "Requesting transcript for visa application",
        priority: "high",
        email: "m.uwase@student.uok.ac.rw",
        category: "General Admin",
        confidence: 72,
        waitTime: "2h 14m",
    },
    {
        id: 2,
        subject: "Scholarship appeal process",
        priority: "high",
        email: "r.habimana@student.uok.ac.rw",
        category: "General Admin",
        confidence: 58,
        waitTime: "4h 01m",
    },
    {
        id: 3,
        subject: "Medical deferral for exam",
        priority: "medium",
        email: "p.niyonsaba@student.uok.ac.rw",
        category: "Exam & Results",
        confidence: 67,
        waitTime: "5h 30m",
    },
    {
        id: 4,
        subject: "Refund request after withdrawal",
        priority: "medium",
        email: "d.mukandori@student.uok.ac.rw",
        category: "Fee & Payment",
        confidence: 61,
        waitTime: "7h 12m",
    },
];

const priorityConfig: Record<Priority, { label: string; className: string }> = {
    high: { label: "high", className: "text-red-500 bg-red-50 border border-red-200" },
    medium: { label: "medium", className: "text-amber-500 bg-amber-50 border border-amber-200" },
    low: { label: "low", className: "text-green-500 bg-green-50 border border-green-200" },
};

const confidenceColor = (val: number) => {
    if (val >= 70) return "text-green-600";
    if (val >= 55) return "text-amber-500";
    return "text-red-500";
};

export default function ReviewDashboard() {
    const [items] = useState(queueItems);

    const handleReview = (id: number) => {
        alert(`Opening review for item #${id}`);
    };

    const pendingCount = items.length;
    const highPriority = items.filter((i) => i.priority === "high").length;

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">

                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Pending Review */}
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                        <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center mb-4">
                            <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{pendingCount}</p>
                        <p className="text-sm text-gray-500 mt-0.5">Pending Review</p>
                        <p className="text-xs text-amber-500 font-medium mt-1">{highPriority} high priority</p>
                    </div>

                    {/* Reviewed Today */}
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                        <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center mb-4">
                            <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">11</p>
                        <p className="text-sm text-gray-500 mt-0.5">Reviewed Today</p>
                        <p className="text-xs text-green-500 font-medium mt-1 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                            </svg>
                            from 8 yesterday
                        </p>
                    </div>

                    {/* Corrections Made */}
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                        <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
                            <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">3</p>
                        <p className="text-sm text-gray-500 mt-0.5">Corrections Made</p>
                        <p className="text-xs text-indigo-400 font-medium mt-1">This week</p>
                    </div>

                    {/* Avg Review Time */}
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                        <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                            <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">4.2m</p>
                        <p className="text-sm text-gray-500 mt-0.5">Avg. Review Time</p>
                        <p className="text-xs text-blue-400 font-medium mt-1">Per email</p>
                    </div>
                </div>

                {/* Review Queue */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <h2 className="text-base font-semibold text-gray-900">Review Queue</h2>
                        <span className="text-sm font-semibold text-amber-500">{pendingCount} pending</span>
                    </div>

                    {/* Items */}
                    <ul className="divide-y divide-gray-100">
                        {items.map((item) => {
                            const pc = priorityConfig[item.priority];
                            return (
                                <li
                                    key={item.id}
                                    className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                                >
                                    {/* Left: subject + meta */}
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-sm font-medium text-gray-900 truncate">
                                                {item.subject}
                                            </span>
                                            <span
                                                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${pc.className}`}
                                            >
                                                {pc.label}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {item.email}&nbsp;·&nbsp;{item.category}
                                        </p>
                                    </div>

                                    {/* Right: confidence + wait + button */}
                                    <div className="flex items-center gap-4 ml-6 shrink-0">
                                        <span className={`text-sm font-semibold tabular-nums ${confidenceColor(item.confidence)}`}>
                                            {item.confidence}%
                                        </span>
                                        <span className="text-xs text-gray-400 tabular-nums w-12 text-right">
                                            {item.waitTime}
                                        </span>
                                        <button
                                            onClick={() => handleReview(item.id)}
                                            className="bg-indigo-700 hover:bg-indigo-800 active:scale-95 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all"
                                        >
                                            Review
                                        </button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        </div>
    );
}
