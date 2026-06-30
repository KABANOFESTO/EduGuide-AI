"use client";

import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { Bell, ChevronDown, Search } from "lucide-react";

import { AuditLogEntry, useGetAuditLogsQuery } from "@/lib/redux/silces/AuditLogSlice";
import { useGetMyDetailsMutation } from "@/lib/redux/silces/AuthSlice";

interface NavbarProps {
    onSearch: (query: string) => void;
}

interface NotificationItem {
    id: number;
    title: string;
    description: string;
    time: string;
}

function formatTime(value?: string) {
    if (!value) return "";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? ""
        : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const Navbar = ({ onSearch }: NavbarProps) => {
    const { data: sessionData } = useSession();
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [searchQuery, setSearchQuery] = useState(searchParams?.get("q") ?? "");
    const [getMyDetails, { data: userDetails, isLoading, error }] = useGetMyDetailsMutation();
    const { data: auditLogs = [] } = useGetAuditLogsQuery(undefined);

    useEffect(() => {
        const urlQuery = searchParams?.get("q") ?? "";
        setSearchQuery(urlQuery);
    }, [searchParams]);

    useEffect(() => {
        const timer = setTimeout(() => {
            onSearch(searchQuery);
            const next = new URLSearchParams(searchParams?.toString() ?? "");
            if (searchQuery.trim()) next.set("q", searchQuery.trim());
            else next.delete("q");
            router.replace(`${pathname}${next.toString() ? `?${next.toString()}` : ""}`);
        }, 250);

        return () => clearTimeout(timer);
    }, [searchQuery, onSearch, pathname, router, searchParams]);

    useEffect(() => {
        getMyDetails();
    }, [getMyDetails]);

    const notifications = useMemo<NotificationItem[]>(() => {
        return auditLogs.slice(0, 5).map((log: AuditLogEntry) => ({
            id: log.id,
            title: log.action?.replaceAll("_", " ") ?? "Activity",
            description: log.user ?? log.target_user ?? "System event",
            time: formatTime(log.timestamp),
        }));
    }, [auditLogs]);

    const getProfileImageUrl = () => {
        if (userDetails?.profile_picture) {
            if (userDetails.profile_picture.startsWith("/media/")) {
                return `${process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000"}${userDetails.profile_picture}`;
            }
            if (userDetails.profile_picture.startsWith("http")) {
                return userDetails.profile_picture;
            }
            return userDetails.profile_picture.startsWith("/")
                ? userDetails.profile_picture
                : `/${userDetails.profile_picture}`;
        }
        return "/profile.png";
    };

    const getUserInitials = () => {
        if (userDetails?.username) {
            const names = userDetails.username.split(" ");
            if (names.length >= 2) return `${names[0][0]}${names[1][0]}`.toUpperCase();
            return userDetails.username.substring(0, 2).toUpperCase();
        }
        return "AD";
    };

    const handleProfileClick = () => {
        setShowNotifications(false);
        setShowUserDropdown((prev) => !prev);
        if (!showUserDropdown) getMyDetails();
    };

    const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (!target.closest(".admin-user-dropdown")) setShowUserDropdown(false);
        if (!target.closest(".admin-notification-dropdown")) setShowNotifications(false);
    };

    useEffect(() => {
        if (showUserDropdown || showNotifications) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showUserDropdown, showNotifications]);

    return (
        <div className="flex w-full items-center justify-between bg-white px-4 py-4">
            <div className="flex-1 max-w-2xl">
                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm focus-within:border-indigo-500 focus-within:bg-white">
                    <Search size={18} className="text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search users, logs, tickets..."
                        className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </label>
            </div>

            <div className="ml-4 flex items-center gap-3">
                <div className="relative admin-notification-dropdown">
                    <button
                        type="button"
                        onClick={() => {
                            setShowUserDropdown(false);
                            setShowNotifications((prev) => !prev);
                        }}
                        className="relative flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200"
                        aria-label="Notifications"
                    >
                        <Bell size={18} />
                        {notifications.length > 0 && (
                            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                                {notifications.length}
                            </span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className="absolute right-0 top-14 z-50 w-96 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
                            <div className="flex items-center justify-between px-2 pb-2">
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">Notifications</p>
                                    <p className="text-xs text-slate-500">Latest admin activity</p>
                                </div>
                                <span className="rounded-full bg-indigo-50 px-2 py-1 text-[11px] font-semibold text-indigo-700">
                                    Live
                                </span>
                            </div>
                            <div className="space-y-2">
                                {notifications.length === 0 ? (
                                    <div className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                                        No recent activity yet.
                                    </div>
                                ) : (
                                    notifications.map((item) => (
                                        <div key={item.id} className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                                            <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                                            <p className="mt-0.5 text-xs text-slate-500">{item.description}</p>
                                            <p className="mt-1 text-[11px] font-medium text-slate-400">{item.time}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="relative admin-user-dropdown">
                    <button
                        type="button"
                        onClick={handleProfileClick}
                        className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-2 py-1.5 shadow-sm transition-colors hover:bg-slate-50"
                    >
                        <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-indigo-900 text-sm font-semibold text-white">
                            {userDetails?.profile_picture ? (
                                <Image
                                    src={getProfileImageUrl()}
                                    alt={`${userDetails.username}'s profile`}
                                    className="h-full w-full object-cover"
                                    width={36}
                                    height={36}
                                />
                            ) : (
                                getUserInitials()
                            )}
                        </div>
                        <div className="hidden text-left md:block">
                            <p className="text-sm font-semibold text-slate-900">
                                {userDetails?.username ?? sessionData?.user?.name ?? "Admin"}
                            </p>
                            <p className="text-xs text-slate-500">{userDetails?.role ?? "Admin"}</p>
                        </div>
                        <ChevronDown size={16} className="text-slate-400" />
                    </button>

                    {showUserDropdown && (
                        <div className="absolute right-0 top-14 z-50 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
                            {isLoading ? (
                                <div className="py-8 text-center text-sm text-slate-500">Loading profile...</div>
                            ) : error ? (
                                <div className="py-6 text-center">
                                    <p className="text-sm text-red-500">Failed to load profile</p>
                                    <button
                                        type="button"
                                        onClick={() => getMyDetails()}
                                        className="mt-3 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
                                    >
                                        Retry
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                                        <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-indigo-900 text-white">
                                            {userDetails?.profile_picture ? (
                                                <Image
                                                    src={getProfileImageUrl()}
                                                    alt={`${userDetails.username}'s profile`}
                                                    className="h-full w-full object-cover"
                                                    width={44}
                                                    height={44}
                                                />
                                            ) : (
                                                getUserInitials()
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900">{userDetails?.username}</p>
                                            <p className="text-xs text-slate-500">{userDetails?.email}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                                            <span className="text-slate-500">Role</span>
                                            <span className="font-semibold text-slate-900">{userDetails?.role}</span>
                                        </div>
                                        <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                                            <span className="text-slate-500">Profile</span>
                                            <span className="font-semibold text-slate-900">Active</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Navbar;
