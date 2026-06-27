'use client';

import { useMemo } from 'react';

/* ── Stat Cards ── */
const stats = [
    {
        id: 1,
        value: '30',
        label: 'Total Users',
        sub: '+2 this week',
        subColor: '#4f46e5',
        iconColor: '#4f46e5',
        iconBg: 'rgba(79,70,229,0.08)',
        icon: (
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
    },
    {
        id: 2,
        value: '234',
        label: 'Emails Today',
        sub: '+18% vs yesterday',
        subColor: '#4f46e5',
        iconColor: '#7c3aed',
        iconBg: 'rgba(124,58,237,0.08)',
        icon: (
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
        ),
    },
    {
        id: 3,
        value: '89.3%',
        label: 'Auto-Replied',
        sub: '↑ 1.2pp',
        subColor: '#16a34a',
        iconColor: '#16a34a',
        iconBg: 'rgba(22,163,74,0.08)',
        icon: (
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <path d="M8 21h8M12 17v4" strokeLinecap="round" />
                <path d="M9 10l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
    },
    {
        id: 4,
        value: '1.8s',
        label: 'Avg Latency',
        sub: 'Target < 3s ✓',
        subColor: '#d97706',
        iconColor: '#d97706',
        iconBg: 'rgba(217,119,6,0.08)',
        icon: (
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" strokeLinecap="round" />
            </svg>
        ),
    },
];

/* ── Weekly Chart Data ── */
const weeklyData = [
    { day: 'Mon', total: 110, auto: 18 },
    { day: 'Tue', total: 168, auto: 22 },
    { day: 'Wed', total: 165, auto: 20 },
    { day: 'Thu', total: 148, auto: 19 },
    { day: 'Fri', total: 215, auto: 28 },
    { day: 'Sat', total: 62, auto: 10 },
    { day: 'Sun', total: 40, auto: 7 },
];

/* ── Department Summary ── */
const departments = [
    { name: "Registrar's Office", emails: 312, color: '#4f46e5', pct: 100 },
    { name: 'Student Affairs', emails: 278, color: '#7c3aed', pct: 89 },
    { name: 'Finance Dept.', emails: 194, color: '#d97706', pct: 62 },
    { name: 'Faculty Admissions', emails: 233, color: '#16a34a', pct: 75 },
];

/* ── System Status ── */
const services = [
    {
        name: 'Email API',
        status: 'Operational',
        icon: (
            <svg width="18" height="18" fill="none" stroke="#16a34a" strokeWidth="1.8" viewBox="0 0 24 24">
                <rect x="2" y="7" width="20" height="14" rx="2" />
                <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" strokeLinecap="round" />
                <line x1="12" y1="12" x2="12" y2="16" strokeLinecap="round" />
                <line x1="10" y1="14" x2="14" y2="14" strokeLinecap="round" />
            </svg>
        ),
    },
    {
        name: 'BERT Classifier',
        status: 'Operational',
        icon: (
            <svg width="18" height="18" fill="none" stroke="#16a34a" strokeWidth="1.8" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4l3 2" strokeLinecap="round" />
            </svg>
        ),
    },
    {
        name: 'T5 Generator',
        status: 'Operational',
        icon: (
            <svg width="18" height="18" fill="none" stroke="#16a34a" strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
    },
];

/* ── Bar Chart ── */
function WeeklyChart() {
    const maxVal = Math.max(...weeklyData.map((d) => d.total));

    return (
        <div className="flex h-48 items-end gap-3 px-2">
            {weeklyData.map((d) => {
                const totalPct = (d.total / maxVal) * 100;
                const autoPct = (d.auto / maxVal) * 100;
                return (
                    <div key={d.day} className="group flex flex-1 flex-col items-center gap-1.5">
                        <div className="relative flex w-full flex-col items-center justify-end" style={{ height: '160px' }}>
                            {/* Total bar */}
                            <div
                                className="w-5/6 rounded-t-lg transition-all duration-300 group-hover:opacity-80"
                                style={{
                                    height: `${totalPct}%`,
                                    background: 'linear-gradient(180deg, #4f46e5 0%, #3730a3 100%)',
                                    minHeight: '4px',
                                }}
                            />
                            {/* Auto bar overlay */}
                            <div
                                className="absolute bottom-0 w-5/6 rounded-t-lg"
                                style={{
                                    height: `${autoPct}%`,
                                    background: 'linear-gradient(180deg, #a78bfa 0%, #7c3aed 100%)',
                                    minHeight: '2px',
                                    opacity: 0.85,
                                }}
                            />
                        </div>
                        <span className="text-[10px] font-medium text-gray-400">{d.day}</span>
                    </div>
                );
            })}
        </div>
    );
}

/* ── Y-axis labels ── */
function YAxisLabels() {
    const labels = [220, 165, 110, 55, 0];
    return (
        <div className="flex flex-col justify-between pr-2 text-right" style={{ height: '160px' }}>
            {labels.map((l) => (
                <span key={l} className="text-[10px] text-gray-400">{l}</span>
            ))}
        </div>
    );
}

/* ── Main Dashboard ── */
export default function AdminDashboard() {
    const dateRange = useMemo(() => {
        const now = new Date();
        const start = new Date(now);
        start.setDate(now.getDate() - now.getDay() + 1);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        const fmt = (d: Date) =>
            d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        return `${fmt(start)} – ${fmt(end)}`;
    }, []);

    return (
        <div className="min-h-screen bg-gray-50/60 p-6 lg:p-8">

            {/* ── Stat Cards ── */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((s) => (
                    <div
                        key={s.id}
                        className="rounded-2xl bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md"
                        style={{ border: '1px solid rgba(0,0,0,0.06)' }}
                    >
                        <div
                            className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl"
                            style={{ background: s.iconBg, color: s.iconColor }}
                        >
                            {s.icon}
                        </div>
                        <p className="text-3xl font-extrabold text-gray-900">{s.value}</p>
                        <p className="mt-0.5 text-sm text-gray-500">{s.label}</p>
                        <p className="mt-2 text-xs font-semibold" style={{ color: s.subColor }}>
                            {s.sub}
                        </p>
                    </div>
                ))}
            </div>

            {/* ── Middle Row ── */}
            <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">

                {/* Weekly Email Volume */}
                <div
                    className="col-span-1 rounded-2xl bg-white p-6 shadow-sm lg:col-span-2"
                    style={{ border: '1px solid rgba(0,0,0,0.06)' }}
                >
                    <div className="mb-4 flex items-start justify-between">
                        <div>
                            <h2 className="text-base font-bold text-gray-900">Weekly Email Volume</h2>
                            <div className="mt-2 flex items-center gap-4">
                                <div className="flex items-center gap-1.5">
                                    <span className="h-2.5 w-2.5 rounded-sm" style={{ background: '#4f46e5' }} />
                                    <span className="text-xs text-gray-500">Total received</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="h-2.5 w-2.5 rounded-sm" style={{ background: '#a78bfa' }} />
                                    <span className="text-xs text-gray-500">Auto-replied</span>
                                </div>
                            </div>
                        </div>
                        <span className="text-xs font-medium text-gray-400">{dateRange}</span>
                    </div>
                    <div className="flex">
                        <YAxisLabels />
                        <div className="flex-1">
                            <WeeklyChart />
                        </div>
                    </div>
                </div>

                {/* Department Summary */}
                <div
                    className="rounded-2xl bg-white p-6 shadow-sm"
                    style={{ border: '1px solid rgba(0,0,0,0.06)' }}
                >
                    <h2 className="mb-5 text-base font-bold text-gray-900">Department Summary</h2>
                    <div className="space-y-5">
                        {departments.map((dept) => (
                            <div key={dept.name}>
                                <div className="mb-1.5 flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700">{dept.name}</span>
                                    <span className="text-xs font-semibold text-gray-400">
                                        {dept.emails} emails
                                    </span>
                                </div>
                                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                                    <div
                                        className="h-full rounded-full transition-all duration-700"
                                        style={{
                                            width: `${dept.pct}%`,
                                            background: dept.color,
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── System Status ── */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {services.map((svc) => (
                    <div
                        key={svc.name}
                        className="flex items-center justify-between rounded-2xl bg-white px-5 py-4 shadow-sm transition-shadow hover:shadow-md"
                        style={{ border: '1px solid rgba(0,0,0,0.06)' }}
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className="flex h-10 w-10 items-center justify-center rounded-xl"
                                style={{ background: 'rgba(22,163,74,0.08)' }}
                            >
                                {svc.icon}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-800">{svc.name}</p>
                                <p className="text-xs font-semibold" style={{ color: '#16a34a' }}>
                                    {svc.status}
                                </p>
                            </div>
                        </div>
                        <div className="relative">
                            <span
                                className="absolute inline-flex h-3 w-3 animate-ping rounded-full opacity-60"
                                style={{ background: '#16a34a' }}
                            />
                            <span
                                className="relative inline-flex h-3 w-3 rounded-full"
                                style={{ background: '#16a34a' }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}