'use client';

import { useState } from 'react';

/* ── Stat cards ── */
const stats = [
    {
        id: 1,
        value: '58%',
        label: 'CPU Usage',
        sub: '4-core cloud VM',
        iconColor: '#16a34a',
        iconBg: 'rgba(22,163,74,0.08)',
        icon: (
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <rect x="4" y="4" width="16" height="16" rx="2" />
                <rect x="9" y="9" width="6" height="6" />
                <path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2" strokeLinecap="round" />
            </svg>
        ),
    },
    {
        id: 2,
        value: '61%',
        label: 'Memory',
        sub: '6.1 GB / 10 GB',
        iconColor: '#16a34a',
        iconBg: 'rgba(22,163,74,0.08)',
        icon: (
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <ellipse cx="12" cy="5" rx="9" ry="3" />
                <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" strokeLinecap="round" />
                <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3" strokeLinecap="round" />
            </svg>
        ),
    },
    {
        id: 3,
        value: '1.7s',
        label: 'Avg Latency',
        sub: 'Target < 3s',
        iconColor: '#16a34a',
        iconBg: 'rgba(22,163,74,0.08)',
        icon: (
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" strokeLinecap="round" />
            </svg>
        ),
    },
    {
        id: 4,
        value: '99.94%',
        label: 'Uptime',
        sub: 'Last 30 days',
        iconColor: '#16a34a',
        iconBg: 'rgba(22,163,74,0.08)',
        icon: (
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
    },
];

/* ── Services ── */
type ServiceStatus = 'Active' | 'Pending' | 'Error';

interface Service {
    name: string;
    version: string;
    uptime: string;
    status: ServiceStatus;
    incident?: string;
}

const services: Service[] = [
    { name: 'Email Ingestion Service', version: 'v2.3.1', uptime: '99.98%', status: 'Active' },
    { name: 'BERT Classifier (GPU)', version: 'v1.2.1', uptime: '99.91%', status: 'Active' },
    { name: 'T5 Generator (GPU)', version: 'v2.1.0', uptime: '99.85%', status: 'Active' },
    { name: 'Confidence Threshold Gate', version: 'v1.4.0', uptime: '100%', status: 'Active' },
    { name: 'Email Dispatch API', version: 'v1.9.2', uptime: '99.72%', status: 'Pending', incident: '1 incident' },
];

/* ── Smooth SVG line chart ── */
const hours = ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'];

const cpuPoints = [32, 28, 30, 45, 62, 68, 65, 60, 58, 55, 52, 50, 48, 45, 43, 40];
const memPoints = [50, 50, 50, 51, 52, 54, 57, 60, 62, 63, 63, 62, 61, 60, 58, 57];

function buildPath(points: number[], W: number, H: number, padY = 20): string {
    const minV = 0, maxV = 100;
    const xs = points.map((_, i) => (i / (points.length - 1)) * W);
    const ys = points.map((v) => H - padY - ((v - minV) / (maxV - minV)) * (H - padY * 2));
    let d = `M ${xs[0]} ${ys[0]}`;
    for (let i = 1; i < xs.length; i++) {
        const cpx = (xs[i - 1] + xs[i]) / 2;
        d += ` C ${cpx} ${ys[i - 1]}, ${cpx} ${ys[i]}, ${xs[i]} ${ys[i]}`;
    }
    return d;
}

function LineChart() {
    const W = 900, H = 200, padY = 20;
    const cpuPath = buildPath(cpuPoints, W, H, padY);
    const memPath = buildPath(memPoints, W, H, padY);
    const yLabels = [100, 75, 50, 25, 0];

    return (
        <div className="flex gap-2">
            {/* Y axis */}
            <div className="flex flex-col justify-between pb-6 pr-1 text-right" style={{ height: H }}>
                {yLabels.map((l) => (
                    <span key={l} className="text-[10px] text-gray-400">{l}</span>
                ))}
            </div>

            <div className="flex-1 overflow-hidden">
                <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
                    {/* Grid lines */}
                    {yLabels.map((l, i) => {
                        const y = padY + (i / (yLabels.length - 1)) * (H - padY * 2);
                        return (
                            <line key={l} x1={0} y1={y} x2={W} y2={y}
                                stroke="rgba(0,0,0,0.06)" strokeWidth="1" strokeDasharray="4 4" />
                        );
                    })}

                    {/* Memory line (dashed violet) */}
                    <path d={memPath} fill="none" stroke="#7c3aed" strokeWidth="2"
                        strokeDasharray="6 4" opacity="0.7" />

                    {/* CPU line (solid indigo) */}
                    <path d={cpuPath} fill="none" stroke="#4f46e5" strokeWidth="2.5" />

                    {/* Current point dot */}
                    {(() => {
                        const lastIdx = cpuPoints.length - 1;
                        const x = (lastIdx / (cpuPoints.length - 1)) * W;
                        const y = H - padY - ((cpuPoints[lastIdx] - 0) / 100) * (H - padY * 2);
                        return (
                            <g>
                                <circle cx={x} cy={y} r="5" fill="#4f46e5" />
                                <circle cx={x} cy={y} r="9" fill="rgba(79,70,229,0.2)" />
                            </g>
                        );
                    })()}
                </svg>

                {/* X axis labels */}
                <div className="flex justify-between px-0 pt-1">
                    {hours.map((h) => (
                        <span key={h} className="text-[10px] text-gray-400">{h}</span>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ── Status pill ── */
function StatusPill({ status, incident }: { status: ServiceStatus; incident?: string }) {
    const cfg: Record<ServiceStatus, { bg: string; text: string; dot: string }> = {
        Active: { bg: 'rgba(22,163,74,0.08)', text: '#16a34a', dot: '#16a34a' },
        Pending: { bg: 'rgba(217,119,6,0.1)', text: '#d97706', dot: '#d97706' },
        Error: { bg: 'rgba(239,68,68,0.08)', text: '#ef4444', dot: '#ef4444' },
    };
    const s = cfg[status];
    return (
        <div className="flex items-center gap-2">
            {incident && (
                <span className="text-xs font-semibold" style={{ color: '#d97706' }}>{incident}</span>
            )}
            <span
                className="rounded-full px-3 py-1 text-xs font-semibold"
                style={{ background: s.bg, color: s.text }}
            >
                {status}
            </span>
        </div>
    );
}

/* ── Dot indicator ── */
function Dot({ status }: { status: ServiceStatus }) {
    const colors: Record<ServiceStatus, string> = {
        Active: '#16a34a',
        Pending: '#d97706',
        Error: '#ef4444',
    };
    const c = colors[status];
    return (
        <span className="relative flex h-2.5 w-2.5 shrink-0">
            {status === 'Active' && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-50"
                    style={{ background: c }} />
            )}
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full" style={{ background: c }} />
        </span>
    );
}

/* ── Main component ── */
export default function SystemHealth() {
    const [refreshing, setRefreshing] = useState(false);

    const handleRefresh = async () => {
        setRefreshing(true);
        await new Promise((r) => setTimeout(r, 1200));
        setRefreshing(false);
    };

    return (
        <div className="min-h-screen bg-gray-50/60 p-6 lg:p-8">

            {/* Page header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900">System Health</h1>
                    <p className="mt-0.5 text-sm text-gray-500">Real-time infrastructure and service monitoring</p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:border-gray-300 hover:shadow-md disabled:opacity-60"
                >
                    <svg
                        width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
                        className={refreshing ? 'animate-spin' : ''}
                    >
                        <path d="M21.5 2v6h-6M2.5 22v-6h6" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3" strokeLinecap="round" />
                    </svg>
                    {refreshing ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>

            {/* ── Stat cards ── */}
            <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((s) => (
                    <div
                        key={s.id}
                        className="rounded-2xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
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
                        <p className="mt-1.5 text-xs text-gray-400">{s.sub}</p>
                    </div>
                ))}
            </div>

            {/* ── Line chart ── */}
            <div
                className="mb-5 rounded-2xl bg-white p-6 shadow-sm"
                style={{ border: '1px solid rgba(0,0,0,0.06)' }}
            >
                <div className="mb-4 flex items-start justify-between">
                    <h2 className="text-base font-bold text-gray-900">24-Hour Resource Usage</h2>
                    <div className="flex items-center gap-5">
                        <div className="flex items-center gap-2">
                            <div className="h-0.5 w-6 rounded-full" style={{ background: '#4f46e5' }} />
                            <span className="text-xs text-gray-500">CPU</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-0.5 w-6 rounded-full border-t-2 border-dashed" style={{ borderColor: '#7c3aed' }} />
                            <span className="text-xs text-gray-500">Memory</span>
                        </div>
                    </div>
                </div>
                <LineChart />
            </div>

            {/* ── Service status ── */}
            <div
                className="rounded-2xl bg-white shadow-sm"
                style={{ border: '1px solid rgba(0,0,0,0.06)' }}
            >
                <div className="border-b border-gray-100 px-6 py-4">
                    <h2 className="text-base font-bold text-gray-900">Service Status</h2>
                </div>
                <div className="divide-y divide-gray-50">
                    {services.map((svc) => (
                        <div
                            key={svc.name}
                            className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-gray-50/60"
                        >
                            <div className="flex items-center gap-3">
                                <Dot status={svc.status} />
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">{svc.name}</p>
                                    <p className="text-xs text-gray-400">{svc.version}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-medium text-gray-400">{svc.uptime}</span>
                                <StatusPill status={svc.status} incident={svc.incident} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
