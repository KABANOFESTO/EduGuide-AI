"use client";

import { useState, FormEvent } from "react";

/* ---------- Toggle ---------- */

interface ToggleProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label: string;
}

function Toggle({ checked, onChange, label }: ToggleProps) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={label}
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${checked ? "bg-indigo-600" : "bg-slate-200"
                }`}
        >
            <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${checked ? "translate-x-5" : "translate-x-0.5"
                    }`}
            />
        </button>
    );
}

/* ---------- SettingsRow ---------- */

interface SettingsRowProps {
    title: string;
    description: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}

function SettingsRow({ title, description, checked, onChange }: SettingsRowProps) {
    return (
        <div className="flex items-start justify-between gap-4 py-4">
            <div>
                <p className="text-sm font-semibold text-slate-900">{title}</p>
                <p className="mt-0.5 text-sm text-slate-500">{description}</p>
            </div>
            <Toggle checked={checked} onChange={onChange} label={title} />
        </div>
    );
}

/* ---------- SettingsCard ---------- */

interface SettingsCardProps {
    title: string;
    children: React.ReactNode;
}

function SettingsCard({ title, children }: SettingsCardProps) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">{title}</h2>
            <div className="mt-2 divide-y divide-slate-100">{children}</div>
        </div>
    );
}

/* ---------- PasswordField ---------- */

interface PasswordFieldProps {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
}

function PasswordField({ id, label, value, onChange }: PasswordFieldProps) {
    return (
        <div>
            <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-slate-900">
                {label}
            </label>
            <input
                id={id}
                type="password"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                autoComplete="new-password"
                className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
        </div>
    );
}

/* ---------- Page ---------- */

interface ToggleState {
    emailNotifications: boolean;
    inAppNotifications: boolean;
    autoApprove: boolean;
    twoFactor: boolean;
}

export default function SettingsPage() {
    const [toggles, setToggles] = useState<ToggleState>({
        emailNotifications: true,
        inAppNotifications: true,
        autoApprove: false,
        twoFactor: false,
    });

    const [passwords, setPasswords] = useState({
        current: "",
        next: "",
        confirm: "",
    });

    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [passwordSuccess, setPasswordSuccess] = useState(false);

    const updateToggle = (key: keyof ToggleState) => (checked: boolean) =>
        setToggles((prev) => ({ ...prev, [key]: checked }));

    const handlePasswordSubmit = (e: FormEvent) => {
        e.preventDefault();
        setPasswordSuccess(false);

        if (!passwords.current || !passwords.next || !passwords.confirm) {
            setPasswordError("Fill in all three password fields.");
            return;
        }
        if (passwords.next.length < 8) {
            setPasswordError("New password must be at least 8 characters.");
            return;
        }
        if (passwords.next !== passwords.confirm) {
            setPasswordError("New password and confirmation don't match.");
            return;
        }

        setPasswordError(null);
        // Wire this up to your auth/account API.
        console.log("Updating password", passwords);
        setPasswords({ current: "", next: "", confirm: "" });
        setPasswordSuccess(true);
    };

    return (
        <div className="min-h-screen bg-slate-50 px-6 py-10">
            <div className="mx-auto flex max-w-xl flex-col gap-6">
                <SettingsCard title="Notifications">
                    <SettingsRow
                        title="Email notifications"
                        description="Receive alerts at inezaghis54@gmail.com"
                        checked={toggles.emailNotifications}
                        onChange={updateToggle("emailNotifications")}
                    />
                    <SettingsRow
                        title="In-app notifications"
                        description="Show notification bell in dashboard"
                        checked={toggles.inAppNotifications}
                        onChange={updateToggle("inAppNotifications")}
                    />
                </SettingsCard>

                <SettingsCard title="Workflow Preferences">
                    <SettingsRow
                        title="Auto-approve high-confidence replies"
                        description="Automatically dispatch replies with >95% confidence"
                        checked={toggles.autoApprove}
                        onChange={updateToggle("autoApprove")}
                    />
                </SettingsCard>

                <SettingsCard title="Security">
                    <SettingsRow
                        title="Two-factor authentication"
                        description="Add an extra layer of security to your account"
                        checked={toggles.twoFactor}
                        onChange={updateToggle("twoFactor")}
                    />
                </SettingsCard>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-base font-semibold text-slate-900">Change Password</h2>
                    <form onSubmit={handlePasswordSubmit} className="mt-4 space-y-4">
                        <PasswordField
                            id="current-password"
                            label="Current password"
                            value={passwords.current}
                            onChange={(v) => setPasswords((p) => ({ ...p, current: v }))}
                        />
                        <PasswordField
                            id="new-password"
                            label="New password"
                            value={passwords.next}
                            onChange={(v) => setPasswords((p) => ({ ...p, next: v }))}
                        />
                        <PasswordField
                            id="confirm-password"
                            label="Confirm new password"
                            value={passwords.confirm}
                            onChange={(v) => setPasswords((p) => ({ ...p, confirm: v }))}
                        />

                        {passwordError && (
                            <p className="text-sm font-medium text-red-600">{passwordError}</p>
                        )}
                        {passwordSuccess && (
                            <p className="text-sm font-medium text-emerald-600">
                                Password updated.
                            </p>
                        )}

                        <button
                            type="submit"
                            className="rounded-full bg-indigo-700 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                            Update Password
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}