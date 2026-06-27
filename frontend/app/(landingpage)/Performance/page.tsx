'use client';

const stats = [
    {
        id: 1,
        value: '>90%',
        label: 'F1 Score Target',
        icon: (
            <svg width="20" height="20" fill="none" stroke="white" strokeWidth="1.8" viewBox="0 0 24 24">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
    },
    {
        id: 2,
        value: '<3s',
        label: 'Response Latency',
        icon: (
            <svg width="20" height="20" fill="none" stroke="white" strokeWidth="1.8" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" strokeLinecap="round" />
            </svg>
        ),
    },
    {
        id: 3,
        value: '\u226599%',
        label: 'System Uptime',
        icon: (
            <svg width="20" height="20" fill="none" stroke="white" strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" />
                <polyline points="22 4 12 14.01 9 11.01" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
    },
    {
        id: 4,
        value: '500k+',
        label: 'Training Emails',
        icon: (
            <svg width="20" height="20" fill="none" stroke="white" strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" />
                <circle cx="12" cy="12" r="3" />
                <path d="M9 9a3 3 0 0 1 6 0" />
            </svg>
        ),
    },
];

const roles = [
    {
        id: 1,
        badge: 'Admin',
        badgeColor: '#4f46e5',
        cardBg: '#f0f1ff',
        cardBorder: 'rgba(79,70,229,0.15)',
        iconBg: 'rgba(79,70,229,0.1)',
        iconColor: '#4f46e5',
        checkColor: '#4f46e5',
        title: 'System Administrator',
        icon: 'settings',
        perms: [
            'Manage users & permissions',
            'Configure email API',
            'Monitor system health',
            'View audit logs',
        ],
    },
    {
        id: 2,
        badge: 'Staff',
        badgeColor: '#7c3aed',
        cardBg: '#f5f0ff',
        cardBorder: 'rgba(124,58,237,0.15)',
        iconBg: 'rgba(124,58,237,0.1)',
        iconColor: '#7c3aed',
        checkColor: '#7c3aed',
        title: 'Email Staff User',
        icon: 'mail',
        perms: [
            'Receive institutional emails',
            'View AI-generated replies',
            'Approve or send replies',
            'Give feedback on AI',
        ],
    },
    {
        id: 3,
        badge: 'Reviewer',
        badgeColor: '#d97706',
        cardBg: '#fffbeb',
        cardBorder: 'rgba(217,119,6,0.15)',
        iconBg: 'rgba(217,119,6,0.1)',
        iconColor: '#d97706',
        checkColor: '#d97706',
        title: 'Human Reviewer',
        icon: 'user-check',
        perms: [
            'Review low-confidence emails',
            'Correct AI responses',
            'Approve final answers',
            'Supply retraining data',
        ],
    },
    {
        id: 4,
        badge: 'ML Ops',
        badgeColor: '#16a34a',
        cardBg: '#f0fdf4',
        cardBorder: 'rgba(22,163,74,0.15)',
        iconBg: 'rgba(22,163,74,0.1)',
        iconColor: '#16a34a',
        checkColor: '#16a34a',
        title: 'AI Model Manager',
        icon: 'brain',
        perms: [
            'Manage training datasets',
            'Monitor F1, BLEU, ROUGE',
            'Retrain and update models',
            'Approve deployments',
        ],
    },
];

function RoleIcon({ type, color }: { type: string; color: string }) {
    const props = {
        width: 22,
        height: 22,
        fill: 'none' as const,
        stroke: color,
        strokeWidth: 1.8,
        viewBox: '0 0 24 24',
    };

    if (type === 'settings') {
        return (
            <svg {...props}>
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        );
    }
    if (type === 'mail') {
        return (
            <svg {...props}>
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
        );
    }
    if (type === 'user-check') {
        return (
            <svg {...props}>
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="9" cy="7" r="4" />
                <polyline points="16 11 18 13 22 9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        );
    }
    if (type === 'brain') {
        return (
            <svg {...props}>
                <path d="M9.5 2a2.5 2.5 0 0 1 5 0M14.5 2C17 2 19 4 19 6.5c0 1.5-.7 2.8-1.8 3.7C18.3 11.1 19 12.4 19 14c0 2.2-1.5 4-3.5 4.5V20a2 2 0 0 1-4 0v-1.5C9.5 18 8 16.2 8 14c0-1.6.7-2.9 1.8-3.8C8.7 9.3 8 8 8 6.5 8 4 10 2 12.5 2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        );
    }
    return null;
}

export default function PerformanceAndRoles() {
    return (
        <>
            {/* ── Performance Benchmarks ── */}
            <section
                id="performance"
                className="w-full py-20 lg:py-28"
                style={{
                    background: 'linear-gradient(135deg, #0f0c29 0%, #1a1a6e 40%, #2563eb 100%)',
                }}
            >
                <div className="mx-auto max-w-7xl px-6 lg:px-10">
                    <h2 className="mb-12 text-center text-4xl font-extrabold tracking-tight text-white lg:text-5xl">
                        Performance Benchmarks
                    </h2>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {stats.map((stat) => (
                            <div
                                key={stat.id}
                                className="flex flex-col items-center gap-4 rounded-2xl p-8 text-center"
                                style={{
                                    background: 'rgba(255,255,255,0.07)',
                                    border: '1px solid rgba(255,255,255,0.12)',
                                    backdropFilter: 'blur(12px)',
                                }}
                            >
                                <div
                                    className="flex h-11 w-11 items-center justify-center rounded-full"
                                    style={{ background: 'rgba(255,255,255,0.12)' }}
                                >
                                    {stat.icon}
                                </div>
                                <div>
                                    <p className="text-4xl font-extrabold text-white">{stat.value}</p>
                                    <p className="mt-1.5 text-sm text-blue-200">{stat.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── 4 Distinct User Roles ── */}
            <section
                id="roles"
                className="w-full bg-white py-20 lg:py-28"
            >
                <div className="mx-auto max-w-7xl px-6 lg:px-10">
                    <h2 className="mb-12 text-center text-4xl font-extrabold tracking-tight text-gray-900 lg:text-5xl">
                        4 Distinct User Roles
                    </h2>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {roles.map((role) => (
                            <div
                                key={role.id}
                                className="relative flex flex-col gap-5 rounded-2xl p-6 transition-all duration-200 hover:-translate-y-1"
                                style={{
                                    background: role.cardBg,
                                    border: `1px solid ${role.cardBorder}`,
                                }}
                            >
                                {/* Badge */}
                                <span
                                    className="absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-bold text-white"
                                    style={{ background: role.badgeColor }}
                                >
                                    {role.badge}
                                </span>

                                {/* Icon */}
                                <div
                                    className="flex h-11 w-11 items-center justify-center rounded-xl"
                                    style={{ background: role.iconBg }}
                                >
                                    <RoleIcon type={role.icon} color={role.iconColor} />
                                </div>

                                {/* Title */}
                                <h3 className="text-base font-bold text-gray-900">{role.title}</h3>

                                {/* Permissions */}
                                <ul className="space-y-2">
                                    {role.perms.map((perm) => (
                                        <li key={perm} className="flex items-center gap-2 text-sm text-gray-600">
                                            <svg
                                                width="15"
                                                height="15"
                                                fill="none"
                                                stroke={role.checkColor}
                                                strokeWidth="2"
                                                viewBox="0 0 24 24"
                                                className="shrink-0"
                                            >
                                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" />
                                                <polyline points="22 4 12 14.01 9 11.01" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            {perm}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}