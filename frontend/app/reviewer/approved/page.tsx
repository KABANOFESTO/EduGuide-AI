"use client";

import { useState } from "react";

type Intent = "Exam & Results" | "Course Registration" | "General Admin" | "Fee & Payment" | "Admissions";

interface ApprovedEmail {
    id: string;
    subject: string;
    from: string;
    intent: Intent;
    confidence: number;
    edited: boolean;
    approvedAt: string;
}

const approvedEmails: ApprovedEmail[] = [
    {
        id: "#1846",
        subject: "Grade change appeal",
        from: "s.ineza@student.uok.ac.rw",
        intent: "Exam & Results",
        confidence: 74,
        edited: false,
        approvedAt: "Today 08:55",
    },
    {
        id: "#1841",
        subject: "Course withdrawal deadline",
        from: "e.nkurunziza@student.uok.ac.rw",
        intent: "Course Registration",
        confidence: 68,
        edited: true,
        approvedAt: "Today 07:40",
    },
    {
        id: "#1836",
        subject: "Transcript for bank loan",
        from: "m.mugisha@student.uok.ac.rw",
        intent: "General Admin",
        confidence: 71,
        edited: true,
        approvedAt: "Yesterday 16:45",
    },
    {
        id: "#1828",
        subject: "Re-sit exam registration",
        from: "c.uwimana@student.uok.ac.rw",
        intent: "Exam & Results",
        confidence: 65,
        edited: false,
        approvedAt: "Yesterday 14:20",
    },
    {
        id: "#1820",
        subject: "Sponsorship letter request",
        from: "p.habimana@student.uok.ac.rw",
        intent: "General Admin",
        confidence: 69,
        edited: true,
        approvedAt: "Yesterday 11:10",
    },
];

const confidenceBadge = (val: number) => {
    if (val >= 70) return "bg-green-50 text-green-600 border-green-200";
    if (val >= 60) return "bg-amber-50 text-amber-500 border-amber-200";
    return "bg-red-50 text-red-500 border-red-200";
};

type SortKey = keyof ApprovedEmail;

export default function ApprovedEmailsPage() {
    const [emails] = useState(approvedEmails);
    const [sortKey, setSortKey] = useState<SortKey | null>(null);
    const [sortAsc, setSortAsc] = useState(true);

    const handleSort = (key: SortKey) => {
        if (sortKey === key) setSortAsc((a) => !a);
        else { setSortKey(key); setSortAsc(true); }
    };

    const sorted = [...emails].sort((a, b) => {
        if (!sortKey) return 0;
        const av = a[sortKey];
        const bv = b[sortKey];
        if (typeof av === "boolean") return sortAsc ? Number(av) - Number(bv) : Number(bv) - Number(av);
        if (typeof av === "number") return sortAsc ? av - (bv as number) : (bv as number) - av;
        return sortAsc
            ? String(av).localeCompare(String(bv))
            : String(bv).localeCompare(String(av));
    });

    const SortIcon = ({ col }: { col: SortKey }) => (
        <span className="ml-1 inline-block opacity-40">
            {sortKey === col ? (sortAsc ? "↑" : "↓") : "↕"}
        </span>
    );

    const thClass = "text-left text-xs font-semibold text-gray-400 tracking-widest uppercase py-3 px-4 cursor-pointer select-none hover:text-gray-600 transition-colors";

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

                    {/* Table Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <h2 className="text-base font-semibold text-gray-900">
                            Approved Emails ({emails.length})
                        </h2>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-green-500">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            All dispatched
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b border-gray-100 bg-gray-50/50">
                                <tr>
                                    <th className={thClass} onClick={() => handleSort("id")}>
                                        ID <SortIcon col="id" />
                                    </th>
                                    <th className={thClass} onClick={() => handleSort("subject")}>
                                        Subject <SortIcon col="subject" />
                                    </th>
                                    <th className={thClass} onClick={() => handleSort("from")}>
                                        From <SortIcon col="from" />
                                    </th>
                                    <th className={thClass} onClick={() => handleSort("intent")}>
                                        Intent <SortIcon col="intent" />
                                    </th>
                                    <th className={thClass} onClick={() => handleSort("confidence")}>
                                        Confidence <SortIcon col="confidence" />
                                    </th>
                                    <th className={thClass} onClick={() => handleSort("edited")}>
                                        Edited <SortIcon col="edited" />
                                    </th>
                                    <th className={thClass} onClick={() => handleSort("approvedAt")}>
                                        Approved At <SortIcon col="approvedAt" />
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {sorted.map((email) => (
                                    <tr
                                        key={email.id}
                                        className="hover:bg-gray-50 transition-colors group"
                                    >
                                        <td className="px-4 py-4 text-xs font-medium text-gray-400 whitespace-nowrap">
                                            {email.id}
                                        </td>
                                        <td className="px-4 py-4 text-sm font-medium text-gray-800 whitespace-nowrap">
                                            {email.subject}
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">
                                            {email.from}
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-600 whitespace-nowrap">
                                            {email.intent}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <span className={`text-xs font-semibold border px-2 py-0.5 rounded ${confidenceBadge(email.confidence)}`}>
                                                {email.confidence}%
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <span className={`text-sm font-medium ${email.edited ? "text-indigo-500" : "text-gray-400"}`}>
                                                {email.edited ? "Yes" : "No"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">
                                            {email.approvedAt}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}