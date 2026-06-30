import { apiSlice } from "./ApiSlice";

export type EmailProcessPayload = {
    sender_name?: string;
    sender_email: string;
    subject: string;
    body: string;
    attachment?: boolean;
    metadata?: Record<string, unknown>;
    message_id?: string | null;
    source_channel?: string;
    assigned_to?: number | null;
    force_review?: boolean;
    force_dispatch?: boolean | null;
};

export type EmailFeedbackPayload = {
    email_id: number;
    rating: number;
    comment?: string;
    feedback_source?: string;
};

export type EmailReviewPayload = {
    corrected_response: string;
    review_status?: "APPROVED" | "REJECTED" | "EDITED";
    reviewer_comment?: string;
    send_after_review?: boolean;
};

const emailApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getEmails: builder.query({
            query: (params = {}) => ({
                url: "emails/",
                method: "GET",
                params,
            }),
            providesTags: ["Email"],
        }),
        getEmailById: builder.query({
            query: (id: number | string) => ({ url: `emails/${id}/`, method: "GET" }),
            providesTags: ["Email"],
        }),
        processEmail: builder.mutation({
            query: (data: EmailProcessPayload) => ({
                url: "emails/process/",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Email", "EmailClassification", "AIResponse", "EmailDispatchLog", "AuditLog"],
        }),
        sendEmailReply: builder.mutation({
            query: (id: number | string) => ({
                url: `emails/${id}/dispatch/`,
                method: "POST",
            }),
            invalidatesTags: ["Email", "AIResponse", "EmailDispatchLog", "AuditLog"],
        }),
        reviewEmail: builder.mutation({
            query: ({ id, data }: { id: number | string; data: EmailReviewPayload }) => ({
                url: `emails/${id}/review/`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Email", "EmailReview", "AIResponse", "EmailDispatchLog", "AuditLog"],
        }),
        submitEmailFeedback: builder.mutation({
            query: ({ id, data }: { id: number | string; data: EmailFeedbackPayload }) => ({
                url: `emails/${id}/feedback/`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Email", "AI_Feedback", "AuditLog"],
        }),
        getEmailDashboard: builder.query({
            query: () => ({ url: "emails/dashboard/", method: "GET" }),
            providesTags: ["Email"],
        }),
        getEmailClassifications: builder.query({
            query: (params = {}) => ({
                url: "emails/classifications/",
                method: "GET",
                params,
            }),
            providesTags: ["EmailClassification"],
        }),
        getEmailResponses: builder.query({
            query: (params = {}) => ({
                url: "emails/responses/",
                method: "GET",
                params,
            }),
            providesTags: ["AIResponse"],
        }),
        getEmailDispatchLogs: builder.query({
            query: (params = {}) => ({
                url: "emails/dispatch-logs/",
                method: "GET",
                params,
            }),
            providesTags: ["EmailDispatchLog"],
        }),
        getPipelineHealth: builder.query({
            query: () => ({ url: "emails/health/", method: "GET" }),
            providesTags: ["Health"],
        }),
    }),
});

export const {
    useGetEmailsQuery,
    useGetEmailByIdQuery,
    useProcessEmailMutation,
    useSendEmailReplyMutation,
    useReviewEmailMutation,
    useSubmitEmailFeedbackMutation,
    useGetEmailDashboardQuery,
    useGetEmailClassificationsQuery,
    useGetEmailResponsesQuery,
    useGetEmailDispatchLogsQuery,
    useGetPipelineHealthQuery,
} = emailApi;
