import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export const apiSlice = createApi({
    reducerPath: "api",
    baseQuery: fetchBaseQuery({
        baseUrl: `${API_BASE_URL}/api/`,
        prepareHeaders: (headers) => {
            if (typeof window !== "undefined") {
                const token = localStorage.getItem("access");
                if (token) {
                    headers.set("Authorization", `Bearer ${token}`);
                }
            }
            return headers;
        },
    }),
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
