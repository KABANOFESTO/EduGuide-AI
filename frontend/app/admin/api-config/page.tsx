"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, RefreshCw, Save, ShieldCheck, ServerCog, Webhook } from "lucide-react";

import {
    EmailPipelineConfigPayload,
    useGetBackendHealthQuery,
    useGetPipelineConfigQuery,
    useUpdatePipelineConfigMutation,
} from "@/lib/redux/silces/PipelineSlice";
import { useSyncMailboxMutation } from "@/lib/redux/silces/EmailSlice";

type ConfigForm = Required<Pick<
    EmailPipelineConfigPayload,
    | "institution_name"
    | "auto_dispatch_threshold"
    | "escalation_threshold"
    | "reviewer_email"
    | "email_dispatch_mode"
    | "classifier_endpoint"
    | "generator_endpoint"
    | "dispatch_endpoint"
    | "reply_signature"
    | "enabled"
>>;

const DEFAULT_FORM: ConfigForm = {
    institution_name: "University of Kigali",
    auto_dispatch_threshold: 0.82,
    escalation_threshold: 0.65,
    reviewer_email: "",
    email_dispatch_mode: "dry_run",
    classifier_endpoint: "",
    generator_endpoint: "",
    dispatch_endpoint: "",
    reply_signature: "University of Kigali Automated Response System",
    enabled: true,
};

function Field({
    label,
    value,
    onChange,
    type = "text",
    step,
    placeholder,
}: {
    label: string;
    value: string | number;
    onChange: (value: string) => void;
    type?: string;
    step?: string;
    placeholder?: string;
}) {
    return (
        <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-widest text-slate-500">
                {label}
            </label>
            <input
                type={type}
                step={step}
                value={value}
                placeholder={placeholder}
                onChange={(e) => onChange(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            />
        </div>
    );
}

function StatusBadge({
    label,
    ok,
}: {
    label: string;
    ok: boolean;
}) {
    return (
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${ok ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
            {label}
        </span>
    );
}

export default function ApiConfigurationPage() {
    const { data: pipelineConfig, isLoading, refetch } = useGetPipelineConfigQuery(undefined);
    const { data: health } = useGetBackendHealthQuery(undefined);
    const [updateConfig, { isLoading: saving }] = useUpdatePipelineConfigMutation();
    const [syncMailbox, { isLoading: syncing }] = useSyncMailboxMutation();
    const [message, setMessage] = useState<string | null>(null);
    const [syncMessage, setSyncMessage] = useState<string | null>(null);
    const [syncLimit, setSyncLimit] = useState(25);
    const [form, setForm] = useState<ConfigForm>(DEFAULT_FORM);

    useEffect(() => {
        if (!pipelineConfig) return;
        setForm({
            institution_name: pipelineConfig.institution_name ?? DEFAULT_FORM.institution_name,
            auto_dispatch_threshold: Number(pipelineConfig.auto_dispatch_threshold ?? DEFAULT_FORM.auto_dispatch_threshold),
            escalation_threshold: Number(pipelineConfig.escalation_threshold ?? DEFAULT_FORM.escalation_threshold),
            reviewer_email: pipelineConfig.reviewer_email ?? "",
            email_dispatch_mode: pipelineConfig.email_dispatch_mode ?? "dry_run",
            classifier_endpoint: pipelineConfig.classifier_endpoint ?? "",
            generator_endpoint: pipelineConfig.generator_endpoint ?? "",
            dispatch_endpoint: pipelineConfig.dispatch_endpoint ?? "",
            reply_signature: pipelineConfig.reply_signature ?? DEFAULT_FORM.reply_signature,
            enabled: Boolean(pipelineConfig.enabled ?? true),
        });
    }, [pipelineConfig]);

    const healthLabel = useMemo(() => {
        if (!health) return { label: "Unknown", ok: false };
        const ok = health.status === "ok";
        return { label: ok ? "Operational" : "Unavailable", ok };
    }, [health]);

    const mailboxLabel = useMemo(() => {
        if (!health) return { label: "Mailbox unknown", ok: false };
        const ok = Boolean(health.inbound_mailbox_configured);
        return { label: ok ? "Mailbox ready" : "Mailbox not configured", ok };
    }, [health]);

    const setField = <K extends keyof ConfigForm>(key: K, value: ConfigForm[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        setMessage(null);
        try {
            await updateConfig({
                institution_name: form.institution_name,
                auto_dispatch_threshold: Number(form.auto_dispatch_threshold),
                escalation_threshold: Number(form.escalation_threshold),
                reviewer_email: form.reviewer_email,
                email_dispatch_mode: form.email_dispatch_mode,
                classifier_endpoint: form.classifier_endpoint,
                generator_endpoint: form.generator_endpoint,
                dispatch_endpoint: form.dispatch_endpoint,
                reply_signature: form.reply_signature,
                enabled: form.enabled,
            }).unwrap();
            setMessage("Pipeline configuration saved successfully.");
            refetch();
        } catch {
            setMessage("Unable to save pipeline configuration.");
        }
    };

    const handleSyncMailbox = async () => {
        setSyncMessage(null);
        try {
            const result = await syncMailbox({ limit: syncLimit }).unwrap();
            setSyncMessage(
                result.configured
                    ? `Imported ${result.imported_count ?? 0} email(s) from ${result.mailbox ?? "the inbox"}.`
                    : "Inbound mailbox sync is not configured yet.",
            );
            refetch();
        } catch {
            setSyncMessage("Mailbox sync failed. Check the backend connection settings.");
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 px-6 py-10">
                <div className="flex items-center justify-center rounded-3xl border border-slate-200 bg-white py-20 text-slate-500 shadow-sm">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Loading pipeline config...
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 px-6 py-10">
            <div className="mx-auto max-w-5xl space-y-6">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900">API Configuration</h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Live pipeline settings for classification, generation, email dispatch, and mailbox intake.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <StatusBadge label={healthLabel.label} ok={healthLabel.ok} />
                        <StatusBadge label={mailboxLabel.label} ok={mailboxLabel.ok} />
                        <button
                            type="button"
                            onClick={() => refetch()}
                            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                        >
                            <RefreshCw size={15} />
                            Refresh
                        </button>
                    </div>
                </div>

                {message && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                        {message}
                    </div>
                )}
                {syncMessage && (
                    <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-medium text-sky-700">
                        {syncMessage}
                    </div>
                )}

                <div className="grid gap-6 lg:grid-cols-2">
                    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700">
                                <ServerCog size={18} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Pipeline Settings</h2>
                                <p className="text-sm text-slate-500">Control dispatch thresholds and integration targets.</p>
                            </div>
                        </div>

                        <div className="grid gap-4">
                            <Field
                                label="Institution name"
                                value={form.institution_name}
                                onChange={(v) => setField("institution_name", v)}
                            />
                            <div className="grid gap-4 sm:grid-cols-2">
                                <Field
                                    label="Auto dispatch threshold"
                                    value={form.auto_dispatch_threshold}
                                    onChange={(v) => setField("auto_dispatch_threshold", Number(v) || 0)}
                                    type="number"
                                    step="0.01"
                                />
                                <Field
                                    label="Escalation threshold"
                                    value={form.escalation_threshold}
                                    onChange={(v) => setField("escalation_threshold", Number(v) || 0)}
                                    type="number"
                                    step="0.01"
                                />
                            </div>
                            <Field
                                label="Reviewer email"
                                value={form.reviewer_email}
                                onChange={(v) => setField("reviewer_email", v)}
                                type="email"
                                placeholder="reviewer@uok.ac.rw"
                            />
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-semibold uppercase tracking-widest text-slate-500">
                                        Email dispatch mode
                                    </label>
                                    <select
                                        value={form.email_dispatch_mode}
                                        onChange={(e) => setField("email_dispatch_mode", e.target.value as ConfigForm["email_dispatch_mode"])}
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                                    >
                                        <option value="dry_run">Dry run</option>
                                        <option value="smtp">SMTP</option>
                                        <option value="external_api">External API</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-semibold uppercase tracking-widest text-slate-500">
                                        Pipeline enabled
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setField("enabled", !form.enabled)}
                                        className={`w-full rounded-2xl border px-4 py-3 text-left text-sm font-semibold ${form.enabled ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}
                                    >
                                        {form.enabled ? "Enabled" : "Disabled"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
                                <Webhook size={18} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Integration Endpoints</h2>
                                <p className="text-sm text-slate-500">Classifier, generator, and dispatch services used by the pipeline.</p>
                            </div>
                        </div>

                        <div className="grid gap-4">
                            <Field
                                label="Classifier endpoint"
                                value={form.classifier_endpoint}
                                onChange={(v) => setField("classifier_endpoint", v)}
                                placeholder="https://classifier.uok.ac.rw/predict"
                            />
                            <Field
                                label="Generator endpoint"
                                value={form.generator_endpoint}
                                onChange={(v) => setField("generator_endpoint", v)}
                                placeholder="https://generator.uok.ac.rw/generate"
                            />
                            <Field
                                label="Dispatch endpoint"
                                value={form.dispatch_endpoint}
                                onChange={(v) => setField("dispatch_endpoint", v)}
                                placeholder="https://mail.uok.ac.rw/dispatch"
                            />
                            <div className="space-y-1.5">
                                <label className="block text-xs font-semibold uppercase tracking-widest text-slate-500">
                                    Reply signature
                                </label>
                                <textarea
                                    value={form.reply_signature}
                                    onChange={(e) => setField("reply_signature", e.target.value)}
                                    rows={5}
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                                />
                            </div>
                        </div>
                    </section>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Current Pipeline Snapshot</h2>
                            <p className="text-sm text-slate-500">
                                Auto dispatch threshold: {Number(form.auto_dispatch_threshold).toFixed(2)}. Escalation threshold: {Number(form.escalation_threshold).toFixed(2)}.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <ShieldCheck size={16} className="text-emerald-600" />
                            <span className="text-sm font-semibold text-slate-700">
                                {form.enabled ? "Operational" : "Paused"}
                            </span>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-wrap items-center gap-3">
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={saving}
                            className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
                        >
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={16} />}
                            Save Configuration
                        </button>
                        <button
                            type="button"
                            onClick={() => refetch()}
                            className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                        >
                            Reload from backend
                        </button>
                    </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Mailbox Intake</h2>
                            <p className="text-sm text-slate-500">
                                Pull unread messages from the configured IMAP mailbox and run them through the live pipeline.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                                Folder: {health?.inbound_mailbox_folder ?? "INBOX"}
                            </span>
                        </div>
                    </div>

                    <div className="mt-5 grid gap-4 sm:grid-cols-[180px_1fr_auto] sm:items-end">
                        <Field
                            label="Sync limit"
                            value={syncLimit}
                            onChange={(v) => setSyncLimit(Number(v) || 0)}
                            type="number"
                            step="1"
                            placeholder="25"
                        />
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                            The backend will import unread emails only, avoid duplicates using message IDs, and immediately classify each message.
                        </div>
                        <button
                            type="button"
                            onClick={handleSyncMailbox}
                            disabled={syncing}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
                        >
                            {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw size={16} />}
                            Sync inbox now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
