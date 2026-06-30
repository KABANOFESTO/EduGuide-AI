import { apiSlice } from "./ApiSlice";

export type EmailPipelineConfigPayload = {
    institution_name?: string;
    auto_dispatch_threshold?: number;
    escalation_threshold?: number;
    reviewer_email?: string;
    email_dispatch_mode?: "dry_run" | "smtp" | "external_api";
    classifier_endpoint?: string;
    generator_endpoint?: string;
    dispatch_endpoint?: string;
    reply_signature?: string;
    enabled?: boolean;
};

const pipelineApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getPipelineConfig: builder.query({
            query: () => ({ url: "emails/config/", method: "GET" }),
            providesTags: ["EmailPipelineConfig"],
        }),
        updatePipelineConfig: builder.mutation({
            query: (data: EmailPipelineConfigPayload) => ({
                url: "emails/config/",
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: ["EmailPipelineConfig", "Email", "AuditLog"],
        }),
        getBackendHealth: builder.query({
            query: () => ({ url: "emails/health/", method: "GET" }),
            providesTags: ["Health"],
        }),
    }),
});

export const {
    useGetPipelineConfigQuery,
    useUpdatePipelineConfigMutation,
    useGetBackendHealthQuery,
} = pipelineApi;
