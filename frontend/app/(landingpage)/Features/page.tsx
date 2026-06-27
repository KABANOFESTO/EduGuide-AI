'use client';

const features = [
    {
        id: 1,
        iconColor: '#4f46e5',
        iconBg: 'rgba(79,70,229,0.08)',
        title: 'BERT Intent Classification',
        description:
            'Fine-tuned BERT model identifies 5 UoK-specific intent categories with >90% F1 accuracy.',
        icon: 'brain',
    },
    {
        id: 2,
        iconColor: '#7c3aed',
        iconBg: 'rgba(124,58,237,0.08)',
        title: 'T5 Response Generation',
        description:
            'Sequence-to-sequence T5 model generates contextually accurate, institution-specific replies.',
        icon: 'bolt',
    },
    {
        id: 3,
        iconColor: '#d97706',
        iconBg: 'rgba(217,119,6,0.08)',
        title: 'Confidence Threshold Gate',
        description:
            'Low-confidence emails are automatically escalated to human reviewer for quality assurance.',
        icon: 'warning',
    },
    {
        id: 4,
        iconColor: '#16a34a',
        iconBg: 'rgba(22,163,74,0.08)',
        title: 'LPDP Compliance',
        description:
            'Full compliance with Rwanda Law No. 058/2021. All PII removed and data encrypted.',
        icon: 'shield',
    },
    {
        id: 5,
        iconColor: '#2563eb',
        iconBg: 'rgba(37,99,235,0.08)',
        title: 'BLEU / ROUGE Evaluation',
        description:
            'Response quality tracked via BLEU and ROUGE scores benchmarked against human references.',
        icon: 'chart',
    },
    {
        id: 6,
        iconColor: '#7c3aed',
        iconBg: 'rgba(124,58,237,0.08)',
        title: 'Feedback Loop',
        description:
            'Staff feedback on replies flows back into the retraining pipeline for continuous improvement.',
        icon: 'activity',
    },
];

function FeatureIcon({ type, color }: { type: string; color: string }) {
    const props = {
        width: 24,
        height: 24,
        fill: 'none' as const,
        stroke: color,
        strokeWidth: 1.8,
        viewBox: '0 0 24 24',
    };

    if (type === 'brain') {
        return (
            <svg {...props}>
                <path
                    d="M9.5 2a2.5 2.5 0 0 1 5 0M9.5 2C7 2 5 4 5 6.5c0 1.5.7 2.8 1.8 3.7C5.7 11.1 5 12.4 5 14c0 2.2 1.5 4 3.5 4.5V20a2 2 0 0 0 4 0v-1.5C14.5 18 16 16.2 16 14c0-1.6-.7-2.9-1.8-3.8C15.3 9.3 16 8 16 6.5 16 4 14 2 11.5 2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path d="M9 10h.01M15 10h.01M9 14h.01M15 14h.01" strokeLinecap="round" />
            </svg>
        );
    }

    if (type === 'bolt') {
        return (
            <svg {...props}>
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        );
    }

    if (type === 'warning') {
        return (
            <svg {...props}>
                <path
                    d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <line x1="12" y1="9" x2="12" y2="13" strokeLinecap="round" />
                <line x1="12" y1="17" x2="12.01" y2="17" strokeLinecap="round" />
            </svg>
        );
    }

    if (type === 'shield') {
        return (
            <svg {...props}>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        );
    }

    if (type === 'chart') {
        return (
            <svg {...props}>
                <line x1="18" y1="20" x2="18" y2="10" strokeLinecap="round" />
                <line x1="12" y1="20" x2="12" y2="4" strokeLinecap="round" />
                <line x1="6" y1="20" x2="6" y2="14" strokeLinecap="round" />
                <rect x="2" y="2" width="20" height="20" rx="2" strokeOpacity="0" />
            </svg>
        );
    }

    if (type === 'activity') {
        return (
            <svg {...props}>
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        );
    }

    return null;
}

export default function FeaturesSection() {
    return (
        <section
            id="features"
            className="w-full py-20 lg:py-28"
            style={{ background: '#ffffff' }}
        >
            <div className="mx-auto max-w-7xl px-6 lg:px-10">

                {/* Section Header */}
                <div className="mb-14 flex flex-col items-center text-center">
                    <div
                        className="mb-5 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest"
                        style={{
                            background: 'rgba(124,58,237,0.07)',
                            border: '1px solid rgba(124,58,237,0.2)',
                            color: '#7c3aed',
                        }}
                    >
                        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <rect x="2" y="3" width="20" height="14" rx="2" />
                            <path d="M8 21h8M12 17v4" />
                        </svg>
                        Capabilities
                    </div>
                    <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 lg:text-5xl">
                        Three&#8209;Stage NLP Pipeline
                    </h2>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature) => (
                        <div
                            key={feature.id}
                            className="group flex flex-col gap-5 rounded-2xl p-7 transition-all duration-200 hover:-translate-y-1"
                            style={{
                                background: '#f8f9ff',
                                border: '1px solid rgba(99,102,241,0.1)',
                                boxShadow: '0 1px 4px rgba(99,102,241,0.04)',
                            }}
                            onMouseEnter={(e) => {
                                (e.currentTarget as HTMLDivElement).style.boxShadow =
                                    '0 12px 32px rgba(99,102,241,0.12)';
                            }}
                            onMouseLeave={(e) => {
                                (e.currentTarget as HTMLDivElement).style.boxShadow =
                                    '0 1px 4px rgba(99,102,241,0.04)';
                            }}
                        >
                            {/* Icon */}
                            <div
                                className="flex h-12 w-12 items-center justify-center rounded-xl"
                                style={{ background: feature.iconBg }}
                            >
                                <FeatureIcon type={feature.icon} color={feature.iconColor} />
                            </div>

                            {/* Text */}
                            <div>
                                <h3 className="text-base font-bold text-gray-900">
                                    {feature.title}
                                </h3>
                                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                                    {feature.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}