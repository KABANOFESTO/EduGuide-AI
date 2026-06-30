import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
    reducerPath: "api",
    baseQuery: fetchBaseQuery({
        baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api/`,
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
