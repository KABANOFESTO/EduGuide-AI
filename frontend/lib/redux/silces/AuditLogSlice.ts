import { apiSlice } from "./ApiSlice";

export interface AuditLogEntry {
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

const auditLogApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getAuditLogs: builder.query<AuditLogEntry[], void>({
            query: () => ({
                url: "audit-logs/",
                method: "GET",
            }),
            transformResponse: (response: { results?: AuditLogEntry[] } | AuditLogEntry[]) =>
                Array.isArray(response) ? response : response?.results ?? [],
            providesTags: ["AuditLog"],
        }),
        getAuditLogById: builder.query<AuditLogEntry, number>({
            query: (id) => ({
                url: `audit-logs/${id}/`,
                method: "GET",
            }),
            providesTags: ["AuditLog"],
        }),
    }),
});

export const {
    useGetAuditLogsQuery,
    useGetAuditLogByIdQuery,
} = auditLogApi;
