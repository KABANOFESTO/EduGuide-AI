"use client";

import { Suspense, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2, Search, UserPlus, RefreshCw } from "lucide-react";

import {
    useCreateUserMutation,
    useDeleteUserMutation,
    useGetAllUsersQuery,
    useToggleUserActiveMutation,
} from "@/lib/redux/silces/AuthSlice";

type Role = "Staff" | "Reviewer" | "Admin";
type Status = "Active" | "Inactive";

interface BackendUser {
    id: number;
    username: string;
    email: string;
    role: Role;
    profile_picture?: string | null;
    is_active: boolean;
}

interface UserRow {
    id: number;
    name: string;
    email: string;
    role: Role;
    department: string;
    status: Status;
    lastActive: string;
}

const departmentByRole: Record<Role, string> = {
    Admin: "IT & Systems",
    Reviewer: "Student Affairs",
    Staff: "Registrar's Office",
};

const roleBadge: Record<Role, string> = {
    Admin: "bg-violet-600 text-white",
    Reviewer: "bg-amber-500 text-white",
    Staff: "bg-indigo-600 text-white",
};

function Avatar({ name, role }: { name: string; role: Role }) {
    const initials = name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0])
        .join("")
        .toUpperCase();

    return (
        <div className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: role === "Admin" ? "#7c3aed" : role === "Reviewer" ? "#d97706" : "#4f46e5" }}>
            {initials || "U"}
        </div>
    );
}

function StatusBadge({ status }: { status: Status }) {
    const active = status === "Active";
    return (
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
            {status}
        </span>
    );
}

function RoleBadge({ role }: { role: Role }) {
    return (
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${roleBadge[role]}`}>
            {role}
        </span>
    );
}

function toRows(users: BackendUser[]): UserRow[] {
    return users.map((user) => ({
        id: user.id,
        name: user.username,
        email: user.email,
        role: user.role,
        department: departmentByRole[user.role],
        status: user.is_active ? "Active" : "Inactive",
        lastActive: "Live",
    }));
}

function InviteModal({
    onClose,
    onInvite,
    saving,
}: {
    onClose: () => void;
    onInvite: (payload: { username: string; email: string; role: Role }) => void;
    saving: boolean;
}) {
    const [form, setForm] = useState({ username: "", email: "", role: "Staff" as Role });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-3xl border border-white/20 bg-white p-6 shadow-2xl">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Invite User</h3>
                        <p className="text-sm text-slate-500">Create an institutional account for the admin backend</p>
                    </div>
                    <button onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">×</button>
                </div>

                <div className="mt-5 grid gap-4">
                    <input
                        value={form.username}
                        onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
                        placeholder="Full name"
                        className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                    <input
                        value={form.email}
                        onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                        placeholder="name@uok.ac.rw"
                        className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                    <select
                        value={form.role}
                        onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value as Role }))}
                        className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    >
                        <option value="Staff">Staff</option>
                        <option value="Reviewer">Reviewer</option>
                        <option value="Admin">Admin</option>
                    </select>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={onClose} className="rounded-2xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                        Cancel
                    </button>
                    <button
                        onClick={() => onInvite(form)}
                        disabled={saving}
                        className="rounded-2xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                    >
                        {saving ? "Creating..." : "Create User"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function UserManagementContent() {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [filterRole, setFilterRole] = useState<Role | "All">("All");
    const [filterStatus, setFilterStatus] = useState<Status | "All">("All");
    const [inviteOpen, setInviteOpen] = useState(false);
    const [toast, setToast] = useState<string | null>(null);

    const searchQuery = searchParams?.get("q") ?? "";
    const { data: backendUsers = [], isLoading, isError, refetch } = useGetAllUsersQuery(undefined);
    const [createUser, { isLoading: creating }] = useCreateUserMutation();
    const [toggleUserActive] = useToggleUserActiveMutation();
    const [deleteUser] = useDeleteUserMutation();

    const users = useMemo(() => toRows(backendUsers as BackendUser[]), [backendUsers]);

    const filtered = users.filter((user) => {
        const term = searchQuery.toLowerCase();
        const matchesSearch =
            user.name.toLowerCase().includes(term) ||
            user.email.toLowerCase().includes(term) ||
            user.department.toLowerCase().includes(term);
        const matchesRole = filterRole === "All" || user.role === filterRole;
        const matchesStatus = filterStatus === "All" || user.status === filterStatus;
        return matchesSearch && matchesRole && matchesStatus;
    });

    const updateQuery = (value: string) => {
        const params = new URLSearchParams(searchParams?.toString() ?? "");
        if (value.trim()) params.set("q", value.trim());
        else params.delete("q");
        router.replace(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`);
    };

    const showToast = (message: string) => {
        setToast(message);
        window.setTimeout(() => setToast(null), 2500);
    };

    const handleCreateUser = async (payload: { username: string; email: string; role: Role }) => {
        await createUser({
            username: payload.username,
            email: payload.email,
            role: payload.role,
            is_active: true,
        }).unwrap();
        setInviteOpen(false);
        showToast("User created and notification email sent.");
        refetch();
    };

    const handleToggleStatus = async (id: number) => {
        await toggleUserActive(id).unwrap();
        showToast("User status updated.");
    };

    const handleDelete = async (id: number) => {
        await deleteUser(id).unwrap();
        showToast("User removed.");
    };

    return (
        <div className="min-h-screen bg-slate-50/80 p-6 lg:p-8">
            {toast && (
                <div className="fixed bottom-6 right-6 z-50 rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-lg">
                    {toast}
                </div>
            )}

            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900">User Management</h1>
                    <p className="text-sm text-slate-500">
                        Manage staff, reviewers, and administrators from the live backend.
                    </p>
                </div>

                <button
                    onClick={() => setInviteOpen(true)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/15"
                >
                    <UserPlus size={16} />
                    Invite User
                </button>
            </div>

            <div className="mb-4 grid gap-3 lg:grid-cols-[1fr_160px_160px]">
                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm focus-within:border-indigo-500">
                    <Search size={18} className="text-slate-400" />
                    <input
                        value={searchQuery}
                        onChange={(e) => updateQuery(e.target.value)}
                        placeholder="Search users..."
                        className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                    />
                </label>
                <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value as Role | "All")}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-indigo-500"
                >
                    <option value="All">All Roles</option>
                    <option value="Admin">Admin</option>
                    <option value="Reviewer">Reviewer</option>
                    <option value="Staff">Staff</option>
                </select>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as Status | "All")}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-indigo-500"
                >
                    <option value="All">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                </select>
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                    <div>
                        <h2 className="text-base font-semibold text-slate-900">Live Users</h2>
                        <p className="text-sm text-slate-500">Search results update instantly from the backend.</p>
                    </div>
                    <button
                        onClick={() => refetch()}
                        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                    >
                        <RefreshCw size={15} />
                        Refresh
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-20 text-slate-500">
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Loading users...
                    </div>
                ) : isError ? (
                    <div className="px-6 py-16 text-center text-sm text-red-500">
                        Failed to load users.
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="px-6 py-16 text-center text-sm text-slate-500">
                        No users match your search.
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {filtered.map((user) => (
                            <div key={user.id} className="grid grid-cols-[1.7fr_0.8fr_1fr_0.6fr_0.6fr] items-center gap-4 px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <Avatar name={user.name} role={user.role} />
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                                        <p className="text-xs text-slate-500">{user.email}</p>
                                    </div>
                                </div>
                                <RoleBadge role={user.role} />
                                <p className="text-sm text-slate-600">{user.department}</p>
                                <StatusBadge status={user.status} />
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={() => handleToggleStatus(user.id)}
                                        className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                                    >
                                        Toggle
                                    </button>
                                    <button
                                        onClick={() => handleDelete(user.id)}
                                        className="rounded-full border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {inviteOpen && (
                <InviteModal
                    onClose={() => setInviteOpen(false)}
                    onInvite={handleCreateUser}
                    saving={creating}
                />
            )}
        </div>
    );
}

export default function UserManagement() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-slate-50/80 p-6 lg:p-8">
                    <div className="rounded-3xl border border-slate-200 bg-white p-10 text-sm text-slate-500 shadow-sm">
                        Loading user management...
                    </div>
                </div>
            }
        >
            <UserManagementContent />
        </Suspense>
    );
}
