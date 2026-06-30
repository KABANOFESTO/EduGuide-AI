"use client";
import React, { useState } from 'react';
import {
    User,
    Zap,
    AlertTriangle,
    RefreshCw,
    Eye,
    Filter,
    ChevronLeft,
    ChevronRight,
    Loader2
} from 'lucide-react';
import { useGetAuditLogsQuery } from "@/lib/redux/silces/AuditLogSlice";

interface AuditLog {
    id: number;
    user: string | null;
    target_user: string;
    action: string;
    ip_address: string;
    user_agent: string;
    timestamp: string;
    additional_data: {
        login_method?: string;
        [key: string]: unknown;
    };
}

type FilterStatus = 'all' | 'LOGIN' | 'LOGOUT' | 'USER_UPDATE' | 'USER_DELETE';

const ActivityLogsDashboard = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');


    const { data: auditLogs = [], isLoading, isError } = useGetAuditLogsQuery({});

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const extractUserName = (targetUser: string | null) => {
        if (!targetUser) return 'System';
        const match = targetUser.match(/^([^(]+)/);
        return match ? match[0].trim() : 'System';
    };

    const extractCompany = (targetUser: string | null) => {
        if (!targetUser) return '----------';
        const match = targetUser.match(/\(([^)]+)\)/);
        return match ? match[1] : '----------';
    };

    const getActionStatus = (action: string) => {
        switch (action) {
            case 'LOGIN':
                return 'Success';
            case 'LOGOUT':
                return 'Success';
            case 'USER_UPDATE':
                return 'Pending';
            case 'USER_DELETE':
                return 'Failed';
            default:
                return 'Success';
        }
    };

    const getActionType = (userAgent: string) => {
        if (userAgent.includes('Thunder Client')) return 'Manual';
        if (userAgent.includes('Postman')) return 'Manual';
        if (userAgent.includes('Mozilla')) return 'User';
        return 'Automated';
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Success':
                return 'bg-green-100 text-green-800';
            case 'Failed':
                return 'bg-red-100 text-red-800';
            case 'Pending':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'Manual':
                return 'bg-blue-100 text-blue-800';
            case 'Automated':
                return 'bg-purple-100 text-purple-800';
            case 'User':
                return 'bg-teal-100 text-teal-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };


    const filteredLogs: AuditLog[] = filterStatus === 'all'
        ? auditLogs
        : auditLogs.filter((log: AuditLog) => log.action === filterStatus);


    const totalItems = filteredLogs.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginatedLogs = filteredLogs.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );


    interface StatsCardConfig {
        title: string;
        value: number;
        icon: React.ComponentType<{ className?: string }>;
        color: string;
    }

    const statsCards: StatsCardConfig[] = [
        {
            title: 'Total Logs',
            value: auditLogs.length,
            icon: User,
            color: 'bg-teal-500'
        },
        {
            title: 'Login Actions',
            value: auditLogs.filter((log: AuditLog) => log.action === 'LOGIN').length,
            icon: Zap,
            color: 'bg-purple-500'
        },
        {
            title: 'Failed Actions',
            value: auditLogs.filter((log: AuditLog) => getActionStatus(log.action) === 'Failed').length,
            icon: AlertTriangle,
            color: 'bg-red-500'
        },
        {
            title: 'Unique IPs',
            value: new Set(auditLogs.map((log: AuditLog) => log.ip_address)).size,
            icon: RefreshCw,
            color: 'bg-blue-500'
        }
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <span className="ml-2 text-gray-600">Loading activity logs...</span>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center p-8 bg-white rounded-lg shadow-sm border border-red-100 max-w-md">
                    <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load logs</h3>
                    <p className="text-gray-500 mb-4">There was an error fetching the activity logs. Please try again later.</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-6 bg-gray-50 min-h-screen">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statsCards.map((card, index) => (
                    <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                            </div>
                            <div className={`${card.color} p-3 rounded-lg`}>
                                <card.icon className="h-6 w-6 text-white" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Activity Logs Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                {/* Table Header */}
                <div className="px-6 py-4 border-b border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Audit Logs</h2>
                            <p className="text-sm text-gray-500 mt-1">Track all system activities and user actions</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4 text-gray-400" />
                                <select
                                    value={filterStatus}
                                    onChange={(e) => {
                                        setFilterStatus(e.target.value as FilterStatus);
                                        setCurrentPage(1);
                                    }}
                                    className="text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                                >
                                    <option value="all">All Actions</option>
                                    <option value="LOGIN">Login</option>
                                    <option value="LOGOUT">Logout</option>
                                    <option value="UPDATE">Update</option>
                                    <option value="DELETE">Delete</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Time
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Action
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Role
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Details
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {paginatedLogs.length > 0 ? (
                                paginatedLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {formatTimestamp(log.timestamp)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {log.user || extractUserName(log.target_user)}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {log.ip_address}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {log.action}
                                            {log.additional_data?.login_method && (
                                                <div className="text-xs text-gray-500 mt-1">
                                                    ({log.additional_data.login_method.replace('_', ' ')})
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {extractCompany(log.target_user)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(getActionType(log.user_agent))}`}>
                                                {getActionType(log.user_agent)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(getActionStatus(log.action))}`}>
                                                {getActionStatus(log.action)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <button
                                                className="text-gray-600 hover:text-gray-700"
                                                onClick={() => {
                                                    // Implement details modal here
                                                    console.log('View details for log:', log.id);
                                                }}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <div className="text-gray-400 mb-4">
                                            <Filter className="h-12 w-12 mx-auto" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No logs found</h3>
                                        <p className="text-gray-500">Try adjusting your filter criteria</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalItems > 0 && (
                    <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-sm text-gray-700">
                            Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                            <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of{' '}
                            <span className="font-medium">{totalItems}</span> logs
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>

                            {/* Show first page */}
                            <button
                                onClick={() => setCurrentPage(1)}
                                className={`px-3 py-1 text-sm rounded ${currentPage === 1 ? 'bg-teal-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                            >
                                1
                            </button>

                            {/* Show current page and nearby pages */}
                            {currentPage > 2 && (
                                <span className="px-2 text-gray-500">...</span>
                            )}

                            {currentPage > 1 && currentPage < totalPages && (
                                <button
                                    onClick={() => setCurrentPage(currentPage)}
                                    className="px-3 py-1 text-sm bg-teal-500 text-white rounded"
                                >
                                    {currentPage}
                                </button>
                            )}

                            {currentPage < totalPages - 1 && (
                                <span className="px-2 text-gray-500">...</span>
                            )}

                            {/* Show last page */}
                            {totalPages > 1 && (
                                <button
                                    onClick={() => setCurrentPage(totalPages)}
                                    className={`px-3 py-1 text-sm rounded ${currentPage === totalPages ? 'bg-teal-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                                >
                                    {totalPages}
                                </button>
                            )}

                            <button
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage >= totalPages}
                                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivityLogsDashboard;
