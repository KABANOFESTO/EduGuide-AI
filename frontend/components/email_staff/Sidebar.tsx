'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    Briefcase,
    Home,
    Inbox,
    Bot,
    Send,
    MessageSquare,
    Settings,
    User,
    LogOut,
    ChevronLeft,
    ChevronUp,
    Menu,
    X,
} from 'lucide-react';
import { useGetCurrentUserQuery } from "@/lib/redux/silces/AuthSlice";

const staffItems = [
    { title: 'Overview', url: '/email_staff/dashboard', icon: Home },
    { title: 'Email Inbox', url: '/email_staff/inbox', icon: Inbox },
    { title: 'AI Replies', url: '/email_staff/ai-replies', icon: Bot },
    { title: 'Sent', url: '/email_staff/sent', icon: Send },
    { title: 'My Feedback', url: '/email_staff/feedback', icon: MessageSquare },
];

/* Swap this to switch the sidebar's nav set / role badge */
const navItems = staffItems;
const roleLabel = 'Email Staff User';

/* ── Types ── */
interface UserDetails {
    username: string;
    email: string;
    role: string;
    department?: string;
    profile_picture?: string;
}

/* ── Confirm logout dialog ── */
function ConfirmDialog({
    open,
    onClose,
    onConfirm,
}: {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
}) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
                <h3 className="text-lg font-bold text-gray-900">Sign out?</h3>
                <p className="mt-2 text-sm text-gray-500">
                    You will be redirected to the login page and will need to sign in again to access your dashboard.
                </p>
                <div className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ── Main Sidebar ── */
export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const { data: currentUser, isLoading: loadingUser } = useGetCurrentUserQuery();

    const userMenuRef = useRef<HTMLDivElement>(null);

    const user: UserDetails | null = currentUser
        ? {
            username: currentUser.username,
            email: currentUser.email,
            role: currentUser.role,
            profile_picture: currentUser.profile_picture ?? "",
        }
        : null;

    /* Close user menu on outside click */
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
                setUserMenuOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSignOut = () => {
        localStorage.clear();
        router.push('/auth');
    };

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
    const avatarSrc =
        user?.profile_picture
            ? user.profile_picture.startsWith('http')
                ? user.profile_picture
                : `${apiBaseUrl}${user.profile_picture}`
            : '';
    const avatarLetter = user?.username?.[0]?.toUpperCase() ?? 'U';
    const currentPath = pathname ?? '';

    /* ── Sidebar content (shared between mobile & desktop) ── */
    const SidebarContent = () => (
        <div
            className="flex h-full flex-col"
            style={{ background: 'linear-gradient(180deg, #0d0e1f 0%, #0f1235 60%, #101428 100%)' }}
        >
            {/* Logo + collapse toggle */}
            <div
                className="flex items-center justify-between px-4 py-4"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
            >
                <div className="flex items-center gap-3 overflow-hidden">
                    <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                        style={{ background: '#4f46e5', boxShadow: '0 0 14px rgba(79,70,229,0.5)' }}
                    >
                        <Briefcase size={18} color="white" strokeWidth={1.8} />
                    </div>
                    {!collapsed && (
                        <div className="overflow-hidden">
                            <p className="truncate text-sm font-bold text-white">UoK MailAI</p>
                            <p className="truncate text-[10px] font-medium tracking-widest text-indigo-300/70">
                                Auto-Reply System
                            </p>
                        </div>
                    )}
                </div>
                <button
                    onClick={() => setCollapsed((v) => !v)}
                    className="hidden rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white md:block"
                    aria-label="Collapse sidebar"
                >
                    <ChevronLeft
                        size={16}
                        className="transition-transform duration-300"
                        style={{ transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    />
                </button>
            </div>

            {/* Role badge */}
            {!collapsed && (
                <div className="px-4 py-3">
                    <div
                        className="flex items-center gap-2 rounded-xl px-3 py-2"
                        style={{ background: 'rgba(79,70,229,0.12)', border: '1px solid rgba(79,70,229,0.25)' }}
                    >
                        <span className="h-2 w-2 rounded-full bg-indigo-400" style={{ boxShadow: '0 0 6px #818cf8' }} />
                        <span className="truncate text-xs font-semibold text-indigo-300">
                            {loadingUser ? 'Loading...' : user?.role ?? roleLabel}
                        </span>
                        <ChevronLeft size={13} className="ml-auto rotate-180 text-indigo-400" />
                    </div>
                </div>
            )}

            {/* Nav items */}
            <nav className="flex-1 overflow-y-auto px-3 py-2">
                <ul className="space-y-1">
                    {navItems.map((item) => {
                        const isActive = currentPath === item.url || currentPath.startsWith(item.url + '/');
                        return (
                            <li key={item.title}>
                                <Link
                                    href={item.url}
                                    onClick={() => setMobileOpen(false)}
                                    title={collapsed ? item.title : undefined}
                                    className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150"
                                    style={{
                                        background: isActive
                                            ? 'linear-gradient(90deg, rgba(79,70,229,0.9), rgba(99,102,241,0.7))'
                                            : 'transparent',
                                        color: isActive ? '#ffffff' : 'rgba(203,213,225,0.75)',
                                        boxShadow: isActive ? '0 2px 12px rgba(79,70,229,0.35)' : 'none',
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isActive) {
                                            (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.06)';
                                            (e.currentTarget as HTMLAnchorElement).style.color = '#ffffff';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isActive) {
                                            (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                                            (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(203,213,225,0.75)';
                                        }
                                    }}
                                >
                                    <item.icon
                                        size={17}
                                        className="shrink-0"
                                        style={{ color: isActive ? '#fff' : '#818cf8' }}
                                    />
                                    {!collapsed && <span className="truncate">{item.title}</span>}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* User card + menu */}
            <div
                className="relative p-3"
                style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
                ref={userMenuRef}
            >
                {!collapsed && (
                    <div className="mb-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-white">
                                    {loadingUser ? 'Loading account...' : user?.username ?? 'Signed-in user'}
                                </p>
                                <p className="truncate text-xs text-slate-400">
                                    {loadingUser ? 'Fetching profile' : user?.email ?? 'No email available'}
                                </p>
                            </div>
                            <span className="shrink-0 rounded-full bg-indigo-500/15 px-2.5 py-1 text-[11px] font-semibold text-indigo-300">
                                {loadingUser ? '...' : user?.role ?? roleLabel}
                            </span>
                        </div>
                        <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-400">
                            <span className="h-2 w-2 rounded-full bg-emerald-400" />
                            <span>Active session</span>
                            {user?.department ? <span className="truncate">· {user.department}</span> : null}
                        </div>
                    </div>
                )}

                {/* User menu popup */}
                {userMenuOpen && (
                    <div
                        className="absolute bottom-full left-3 right-3 mb-2 overflow-hidden rounded-2xl shadow-2xl"
                        style={{
                            background: '#1a1b3a',
                            border: '1px solid rgba(255,255,255,0.1)',
                        }}
                    >
                        {/* User info header */}
                        <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                            <p className="text-sm font-bold text-white">{user?.username}</p>
                            <p className="text-xs text-gray-400">{user?.email}</p>
                            {user?.department && (
                                <p className="mt-0.5 text-xs font-medium text-gray-500">{user.department}</p>
                            )}
                        </div>
                        {/* Actions */}
                        <div className="p-2">
                            <Link
                                href="/email_staff/profile"
                                onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-white/8 hover:text-white"
                            >
                                <User size={15} className="text-indigo-400" />
                                Profile
                            </Link>
                            <Link
                                href="/email_staff/settings"
                                onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-white/8 hover:text-white"
                            >
                                <Settings size={15} className="text-indigo-400" />
                                Settings
                            </Link>
                            <button
                                onClick={() => {
                                    setUserMenuOpen(false);
                                    setConfirmOpen(true);
                                }}
                                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
                            >
                                <LogOut size={15} />
                                Sign Out
                            </button>
                        </div>
                    </div>
                )}

                {/* Avatar trigger */}
                <button
                    onClick={() => setUserMenuOpen((v) => !v)}
                    className="flex w-full items-center gap-3 rounded-xl p-2 transition-colors hover:bg-white/6"
                    aria-label="User menu"
                >
                    {/* Avatar */}
                    <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                        style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
                    >
                        {loadingUser ? (
                            <span className="animate-pulse">...</span>
                        ) : avatarSrc ? (
                            <img
                                src={avatarSrc}
                                alt={user.username}
                                className="h-full w-full rounded-full object-cover"
                            />
                        ) : (
                            avatarLetter
                        )}
                    </div>
                    {!collapsed && (
                        <>
                            <div className="flex-1 overflow-hidden text-left">
                                {loadingUser ? (
                                    <div className="space-y-1">
                                        <div className="h-3 w-24 animate-pulse rounded bg-white/10" />
                                        <div className="h-2.5 w-32 animate-pulse rounded bg-white/10" />
                                    </div>
                                ) : (
                                    <>
                                        <p className="truncate text-sm font-semibold text-white">{user?.username}</p>
                                        <p className="truncate text-xs text-gray-400">{user?.email}</p>
                                    </>
                                )}
                            </div>
                            <ChevronUp
                                size={14}
                                className="shrink-0 text-gray-400 transition-transform duration-200"
                                style={{ transform: userMenuOpen ? 'rotate(0deg)' : 'rotate(180deg)' }}
                            />
                        </>
                    )}
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile hamburger */}
            <button
                onClick={() => setMobileOpen((v) => !v)}
                className="fixed left-4 top-4 z-[150] rounded-lg p-2 text-white shadow-lg md:hidden"
                style={{ background: '#4f46e5' }}
                aria-label="Toggle menu"
            >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Mobile backdrop */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-[140] bg-black/60 backdrop-blur-sm md:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Mobile drawer */}
            <aside
                className="fixed inset-y-0 left-0 z-[145] w-64 transition-transform duration-300 md:hidden"
                style={{ transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)' }}
            >
                <SidebarContent />
            </aside>

            {/* Desktop sidebar */}
            <aside
                className="sticky top-0 hidden h-screen flex-col transition-all duration-300 md:flex"
                style={{ width: collapsed ? '72px' : '240px', minWidth: collapsed ? '72px' : '240px' }}
            >
                <SidebarContent />
            </aside>

            {/* Confirm dialog */}
            <ConfirmDialog
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={handleSignOut}
            />
        </>
    );
}
