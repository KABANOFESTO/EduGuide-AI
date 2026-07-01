import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const AUTH_ENDPOINTS = new Set([
    "login",
    "register",
    "forgotPassword",
    "resetPassword",
]);

const rawBaseQuery = fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/api/`,
    prepareHeaders: (headers, api) => {
        if (typeof window !== "undefined" && !AUTH_ENDPOINTS.has(api.endpoint)) {
            const token = localStorage.getItem("access");
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
        }
        return headers;
    },
});

export const apiSlice = createApi({
    reducerPath: "api",
    baseQuery: async (args, api, extraOptions) => {
        const result = await rawBaseQuery(args, api, extraOptions);

        if (
            result.error &&
            typeof window !== "undefined" &&
            typeof result.error === "object" &&
            "status" in result.error
        ) {
            const status = (result.error as { status?: number | string }).status;
            if (status === 401) {
                localStorage.removeItem("access");
                localStorage.removeItem("refresh");
            }
        }

        return result;
    },
    tagTypes: [
        "Auth",
        "AuditLog",
        "Email",
        "EmailClassification",
        "AIResponse",
        "EmailReview",
        "AI_Feedback",
        "EmailDispatchLog",
        "EmailPipelineConfig",
        "TrainingData",
        "Health",
        "Document",
        "Notification",
        "Report",
        "Organization",
        "Position",
        "Application",
        "Placement",
        "Evaluation",
        "EvaluationCriterion",
        "EvaluationRating",
        "ProgressLog",
        "Milestone",
        "Attendance",
        "Analytics",
        "Communication",
    ],
    endpoints: () => ({}),
});