'use client';

import { useState } from 'react';

type Role = 'Staff' | 'Reviewer' | 'ML Ops' | 'Admin';
type Status = 'Active' | 'Inactive';

interface User {
    id: number;
    name: string;
    email: string;
    role: Role;
    department: string;
    status: Status;
    lastActive: string;
}

const initialUsers: User[] = [
    { id: 1, name: 'Alice Murebwayire', email: 'a.murebwayire@uok.ac.rw', role: 'Staff', department: "Registrar's Office", status: 'Active', lastActive: 'Today' },
    { id: 2, name: 'Jean-Baptiste Ndayisaba', email: 'j.ndayisaba@uok.ac.rw', role: 'Reviewer', department: 'Student Affairs', status: 'Active', lastActive: 'Today' },
    { id: 3, name: 'Claire Uwimana', email: 'c.uwimana@uok.ac.rw', role: 'ML Ops', department: 'IT & Systems', status: 'Active', lastActive: 'Yesterday' },
    { id: 4, name: 'Patrick Habimana', email: 'p.habimana@uok.ac.rw', role: 'Staff', department: 'Finance Department', status: 'Inactive', lastActive: 'Jun 20' },
    { id: 5, name: 'Sandrine Ineza', email: 's.ineza@uok.ac.rw', role: 'Staff', department: 'Faculty Admissions', status: 'Active', lastActive: 'Today' },
    { id: 6, name: 'Emmanuel Nkurunziza', email: 'e.nkurunziza@uok.ac.rw', role: 'Reviewer', department: "Registrar's Office", status: 'Active', lastActive: 'Today' },
];

const roleStyles: Record<Role, { bg: string; text: string }> = {
    Staff: { bg: '#4f46e5', text: '#fff' },
    Reviewer: { bg: '#d97706', text: '#fff' },
    'ML Ops': { bg: '#16a34a', text: '#fff' },
    Admin: { bg: '#7c3aed', text: '#fff' },
};

function Avatar({ name, role }: { name: string; role: Role }) {
    const initials = name.split(' ').slice(0, 2).map((n) => n[0]).join('');
    return (
        <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ background: roleStyles[role].bg }}
        >
            {initials}
        </div>
    );
}

function RoleBadge({ role }: { role: Role }) {
    const s = roleStyles[role];
    return (
        <span
            className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
            style={{ background: s.bg, color: s.text }}
        >
            {role}
        </span>
    );
}

function StatusBadge({ status }: { status: Status }) {
    const isActive = status === 'Active';
    return (
        <span
            className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
            style={{
                background: isActive ? 'rgba(22,163,74,0.08)' : 'rgba(107,114,128,0.1)',
                color: isActive ? '#16a34a' : '#6b7280',
                border: `1px solid ${isActive ? 'rgba(22,163,74,0.2)' : 'rgba(107,114,128,0.2)'}`,
            }}
        >
            {status}
        </span>
    );
}

/* ── Invite Modal ── */
function InviteModal({ onClose }: { onClose: () => void }) {
    const departments = ["Registrar's Office", 'Student Affairs', 'Finance Department', 'Faculty Admissions', 'IT & Systems'];
    const roles: Role[] = ['Staff', 'Reviewer', 'ML Ops', 'Admin'];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" style={{ border: '1px solid rgba(0,0,0,0.08)' }}>
                <div className="mb-5 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Invite User</h3>
                        <p className="text-sm text-gray-500">Send an invitation to join UoK MailAI</p>
                    </div>
                    <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-gray-500">Full Name</label>
                        <input type="text" placeholder="Dr. Jean-Baptiste Uwimana" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-gray-500">Institutional Email</label>
                        <input type="email" placeholder="name@uok.ac.rw" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-gray-500">Role</label>
                            <select className="w-full appearance-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20">
                                {roles.map((r) => <option key={r}>{r}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-gray-500">Department</label>
                            <select className="w-full appearance-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20">
                                {departments.map((d) => <option key={d}>{d}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button onClick={onClose} className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                            Cancel
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 rounded-xl py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5"
                            style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', boxShadow: '0 6px 20px rgba(79,70,229,0.3)' }}
                        >
                            Send Invite
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ── Row Actions Menu ── */
function RowMenu({ userId, onDeactivate, onDelete }: { userId: number; onDeactivate: (id: number) => void; onDelete: (id: number) => void }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="relative">
            <button
                onClick={() => setOpen((v) => !v)}
                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            >
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
                </svg>
            </button>
            {open && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
                    <div
                        className="absolute right-0 top-8 z-20 w-44 overflow-hidden rounded-xl bg-white shadow-xl"
                        style={{ border: '1px solid rgba(0,0,0,0.08)' }}
                    >
                        <button
                            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => { setOpen(false); }}
                        >
                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeLinecap="round" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Edit User
                        </button>
                        <button
                            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-amber-600 hover:bg-amber-50"
                            onClick={() => { onDeactivate(userId); setOpen(false); }}
                        >
                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" strokeLinecap="round" />
                            </svg>
                            Toggle Status
                        </button>
                        <button
                            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-red-500 hover:bg-red-50"
                            onClick={() => { onDelete(userId); setOpen(false); }}
                        >
                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <polyline points="3 6 5 6 21 6" strokeLinecap="round" /><path d="M19 6l-1 14H6L5 6" strokeLinecap="round" strokeLinejoin="round" /><path d="M10 11v6M14 11v6" strokeLinecap="round" /><path d="M9 6V4h6v2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Remove User
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

/* ── Main Page ── */
export default function UserManagement() {
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [search, setSearch] = useState('');
    const [filterRole, setFilterRole] = useState<Role | 'All'>('All');
    const [filterStatus, setFilterStatus] = useState<Status | 'All'>('All');
    const [inviteOpen, setInviteOpen] = useState(false);

    const filtered = users.filter((u) => {
        const matchSearch =
            u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase());
        const matchRole = filterRole === 'All' || u.role === filterRole;
        const matchStatus = filterStatus === 'All' || u.status === filterStatus;
        return matchSearch && matchRole && matchStatus;
    });

    const toggleStatus = (id: number) => {
        setUsers((prev) =>
            prev.map((u) => u.id === id ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' } : u)
        );
    };

    const deleteUser = (id: number) => {
        setUsers((prev) => prev.filter((u) => u.id !== id));
    };

    return (
        <div className="min-h-screen bg-gray-50/60 p-6 lg:p-8">

            {/* Header */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">
                        All Users ({filtered.length})
                    </h1>
                </div>
                <button
                    onClick={() => setInviteOpen(true)}
                    className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5"
                    style={{
                        background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
                        boxShadow: '0 6px 20px rgba(79,70,229,0.3)',
                    }}
                >
                    <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="9" cy="7" r="4" />
                        <line x1="19" y1="8" x2="19" y2="14" strokeLinecap="round" />
                        <line x1="22" y1="11" x2="16" y2="11" strokeLinecap="round" />
                    </svg>
                    Invite User
                </button>
            </div>

            {/* Filters */}
            <div className="mb-4 flex flex-wrap gap-3">
                {/* Search */}
                <div className="relative min-w-[220px] flex-1">
                    <div className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center">
                        <svg width="14" height="14" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24">
                            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" strokeLinecap="round" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    />
                </div>
                {/* Role filter */}
                <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value as Role | 'All')}
                    className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                >
                    <option value="All">All Roles</option>
                    <option>Staff</option>
                    <option>Reviewer</option>
                    <option>ML Ops</option>
                    <option>Admin</option>
                </select>
                {/* Status filter */}
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as Status | 'All')}
                    className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                >
                    <option value="All">All Status</option>
                    <option>Active</option>
                    <option>Inactive</option>
                </select>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-2xl bg-white shadow-sm" style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
                {/* Table header */}
                <div
                    className="grid grid-cols-[2fr_1fr_1.5fr_1fr_1fr_40px] gap-4 px-6 py-3"
                    style={{ borderBottom: '1px solid rgba(0,0,0,0.06)', background: '#fafafa' }}
                >
                    {['NAME', 'ROLE', 'DEPARTMENT', 'STATUS', 'LAST ACTIVE', ''].map((col) => (
                        <span key={col} className="text-xs font-semibold tracking-wider text-gray-400">
                            {col}
                        </span>
                    ))}
                </div>

                {/* Rows */}
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <svg width="40" height="40" fill="none" stroke="#d1d5db" strokeWidth="1.5" viewBox="0 0 24 24" className="mb-3">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeLinecap="round" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" />
                        </svg>
                        <p className="text-sm font-medium text-gray-400">No users found</p>
                        <p className="text-xs text-gray-300">Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {filtered.map((user) => (
                            <div
                                key={user.id}
                                className="grid grid-cols-[2fr_1fr_1.5fr_1fr_1fr_40px] items-center gap-4 px-6 py-4 transition-colors hover:bg-gray-50/70"
                            >
                                {/* Name + email */}
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <Avatar name={user.name} role={user.role} />
                                    <div className="overflow-hidden">
                                        <p className="truncate text-sm font-semibold text-gray-900">{user.name}</p>
                                        <p className="truncate text-xs text-gray-400">{user.email}</p>
                                    </div>
                                </div>
                                {/* Role */}
                                <div><RoleBadge role={user.role} /></div>
                                {/* Department */}
                                <p className="truncate text-sm text-gray-500">{user.department}</p>
                                {/* Status */}
                                <div><StatusBadge status={user.status} /></div>
                                {/* Last active */}
                                <p className="text-sm text-gray-400">{user.lastActive}</p>
                                {/* Actions */}
                                <RowMenu userId={user.id} onDeactivate={toggleStatus} onDelete={deleteUser} />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Invite modal */}
            {inviteOpen && <InviteModal onClose={() => setInviteOpen(false)} />}
        </div>
    );
}