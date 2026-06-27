'use client';

import { useState } from 'react';

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={enabled}
            onClick={() => onChange(!enabled)}
            className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200"
            style={{ background: enabled ? '#4f46e5' : '#d1d5db' }}
        >
            <span
                className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition-transform duration-200"
                style={{
                    marginTop: '2px',
                    marginLeft: enabled ? '22px' : '2px',
                }}
            />
        </button>
    );
}

type ConnectionStatus = 'Connected' | 'Reachable' | 'Valid' | 'Disconnected' | 'Error';

function StatusPill({ status }: { status: ConnectionStatus }) {
    const isOk = ['Connected', 'Reachable', 'Valid'].includes(status);
    return (
        <div className="flex items-center gap-2">
            <span
                className="relative flex h-2.5 w-2.5"
            >
                {isOk && (
                    <span
                        className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
                        style={{ background: '#16a34a' }}
                    />
                )}
                <span
                    className="relative inline-flex h-2.5 w-2.5 rounded-full"
                    style={{ background: isOk ? '#16a34a' : '#ef4444' }}
                />
            </span>
            <span className="text-sm font-semibold" style={{ color: isOk ? '#16a34a' : '#ef4444' }}>
                {status}
            </span>
        </div>
    );
}

export default function ApiConfiguration() {
    const [tlsEnabled, setTlsEnabled] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const [config, setConfig] = useState({
        smtpHost: 'smtp.uok.ac.rw',
        smtpPort: '587',
        serviceAccount: 'mailai-service@uok.ac.rw',
        fromAddress: 'noreply@uok.ac.rw',
        timeout: '10',
        maxRetries: '3',
        webhookUrl: 'https://api.uok.ac.rw/mailai/webhook',
    });

    const handleChange = (field: keyof typeof config) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setConfig((prev) => ({ ...prev, [field]: e.target.value }));
    };

    const handleSave = async () => {
        setSaving(true);
        setSaveSuccess(false);
        await new Promise((r) => setTimeout(r, 1200));
        setSaving(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
    };

    const handleTest = async () => {
        setTesting(true);
        await new Promise((r) => setTimeout(r, 1800));
        setTesting(false);
    };

    const connectionItems: { label: string; sub: string; status: ConnectionStatus }[] = [
        { label: 'SMTP Server', sub: `${config.smtpHost}:${config.smtpPort}`, status: 'Connected' },
        { label: 'Webhook Endpoint', sub: '200 OK · 142ms', status: 'Reachable' },
        { label: 'Email API Auth', sub: 'Token expires Jul 26, 2025', status: 'Valid' },
    ];

    const inputClass =
        'w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 placeholder-gray-400';

    return (
        <div className="flex min-h-screen items-start justify-center bg-gray-50/70 px-4 py-12">
            <div className="w-full max-w-2xl space-y-5">

                {/* Page title */}
                <div className="mb-2">
                    <h1 className="text-2xl font-extrabold text-gray-900">API Configuration</h1>
                    <p className="mt-1 text-sm text-gray-500">Manage SMTP server, webhook, and connection settings.</p>
                </div>

                {/* ── SMTP / Email Server ── */}
                <div className="overflow-hidden rounded-2xl bg-white shadow-sm" style={{ border: '1px solid rgba(0,0,0,0.07)' }}>
                    {/* Card header */}
                    <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-4">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: 'rgba(79,70,229,0.08)' }}>
                            <svg width="18" height="18" fill="none" stroke="#4f46e5" strokeWidth="1.8" viewBox="0 0 24 24">
                                <rect x="2" y="7" width="20" height="14" rx="2" />
                                <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" strokeLinecap="round" />
                                <line x1="12" y1="12" x2="12" y2="16" strokeLinecap="round" />
                                <line x1="10" y1="14" x2="14" y2="14" strokeLinecap="round" />
                            </svg>
                        </div>
                        <h2 className="text-base font-bold text-gray-900">SMTP / Email Server</h2>
                    </div>

                    <div className="space-y-5 p-6">
                        {/* Row 1 */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-gray-500">SMTP Host</label>
                                <input value={config.smtpHost} onChange={handleChange('smtpHost')} placeholder="smtp.uok.ac.rw" className={inputClass} />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-gray-500">SMTP Port</label>
                                <input value={config.smtpPort} onChange={handleChange('smtpPort')} placeholder="587" className={inputClass} />
                            </div>
                        </div>

                        {/* Row 2 */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-gray-500">Service Account</label>
                                <input value={config.serviceAccount} onChange={handleChange('serviceAccount')} placeholder="mailai-service@uok.ac.rw" className={inputClass} />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-gray-500">From Address</label>
                                <input value={config.fromAddress} onChange={handleChange('fromAddress')} placeholder="noreply@uok.ac.rw" className={inputClass} />
                            </div>
                        </div>

                        {/* Row 3 */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-gray-500">Connection Timeout (s)</label>
                                <input value={config.timeout} onChange={handleChange('timeout')} placeholder="10" className={inputClass} />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-gray-500">Max Retries</label>
                                <input value={config.maxRetries} onChange={handleChange('maxRetries')} placeholder="3" className={inputClass} />
                            </div>
                        </div>

                        {/* TLS toggle */}
                        <div
                            className="flex items-center justify-between rounded-xl px-4 py-3"
                            style={{ background: 'rgba(79,70,229,0.04)', border: '1px solid rgba(79,70,229,0.1)' }}
                        >
                            <div>
                                <p className="text-sm font-semibold text-gray-800">Enable TLS / STARTTLS</p>
                                <p className="text-xs text-gray-400">Encrypt SMTP connection</p>
                            </div>
                            <Toggle enabled={tlsEnabled} onChange={setTlsEnabled} />
                        </div>
                    </div>
                </div>

                {/* ── Webhook & Callback ── */}
                <div className="overflow-hidden rounded-2xl bg-white shadow-sm" style={{ border: '1px solid rgba(0,0,0,0.07)' }}>
                    <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-4">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: 'rgba(124,58,237,0.08)' }}>
                            <svg width="18" height="18" fill="none" stroke="#7c3aed" strokeWidth="1.8" viewBox="0 0 24 24">
                                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <h2 className="text-base font-bold text-gray-900">Webhook &amp; Callback</h2>
                    </div>

                    <div className="p-6">
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-gray-500">Dispatch Webhook URL</label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                                <svg width="14" height="14" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24">
                                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <input
                                value={config.webhookUrl}
                                onChange={handleChange('webhookUrl')}
                                placeholder="https://api.uok.ac.rw/mailai/webhook"
                                className={`${inputClass} pl-10`}
                            />
                        </div>
                        <p className="mt-2 text-xs text-gray-400">
                            Called after every auto-dispatched reply. Include status, email ID, and confidence score in payload.
                        </p>
                    </div>
                </div>

                {/* ── Connection Status ── */}
                <div className="overflow-hidden rounded-2xl bg-white shadow-sm" style={{ border: '1px solid rgba(0,0,0,0.07)' }}>
                    <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-4">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: 'rgba(22,163,74,0.08)' }}>
                            <svg width="18" height="18" fill="none" stroke="#16a34a" strokeWidth="1.8" viewBox="0 0 24 24">
                                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <h2 className="text-base font-bold text-gray-900">Connection Status</h2>
                    </div>

                    <div className="divide-y divide-gray-50 px-6">
                        {connectionItems.map((item) => (
                            <div key={item.label} className="flex items-center justify-between py-4">
                                <div>
                                    <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                                    <p className="text-xs text-gray-400">{item.sub}</p>
                                </div>
                                <StatusPill status={item.status} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Action Buttons ── */}
                <div className="flex items-center gap-3 pb-4">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-70"
                        style={{
                            background: saveSuccess
                                ? '#16a34a'
                                : 'linear-gradient(135deg,#4f46e5,#7c3aed)',
                            boxShadow: '0 6px 20px rgba(79,70,229,0.3)',
                        }}
                    >
                        {saving ? (
                            <>
                                <svg className="animate-spin" width="15" height="15" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                                    <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
                                </svg>
                                Saving...
                            </>
                        ) : saveSuccess ? (
                            <>
                                <svg width="15" height="15" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Saved!
                            </>
                        ) : (
                            <>
                                <svg width="15" height="15" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" strokeLinecap="round" strokeLinejoin="round" />
                                    <polyline points="17 21 17 13 7 13 7 21" strokeLinecap="round" />
                                    <polyline points="7 3 7 8 15 8" strokeLinecap="round" />
                                </svg>
                                Save Configuration
                            </>
                        )}
                    </button>

                    <button
                        onClick={handleTest}
                        disabled={testing}
                        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:border-gray-300 hover:shadow-md disabled:opacity-60"
                    >
                        {testing ? (
                            <>
                                <svg className="animate-spin" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
                                </svg>
                                Testing...
                            </>
                        ) : (
                            <>
                                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Test Connection
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}