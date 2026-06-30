import { apiSlice } from "./ApiSlice";

export type TrainingDataPayload = {
    input_email: string;
    expected_category: "ADMISSION" | "FEES" | "REGISTRATION" | "EXAM" | "ADMIN";
    expected_response: string;
    anonymized?: boolean;
    pii_removed?: boolean;
    source?: string;
    notes?: string;
    metadata?: Record<string, unknown>;
};

const trainingDataApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getTrainingData: builder.query({
            query: (params = {}) => ({
                url: "training-data/",
                method: "GET",
                params,
            }),
            transformResponse: (response: { results?: unknown[] } | unknown[]) =>
                Array.isArray(response) ? response : response?.results ?? [],
            providesTags: ["TrainingData"],
        }),
        getTrainingDataById: builder.query({
            query: (id: number | string) => ({ url: `training-data/${id}/`, method: "GET" }),
            providesTags: ["TrainingData"],
        }),
        createTrainingData: builder.mutation({
            query: (data: TrainingDataPayload) => ({
                url: "training-data/",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["TrainingData", "AuditLog"],
        }),
        updateTrainingData: builder.mutation({
            query: ({ id, data }: { id: number | string; data: Partial<TrainingDataPayload> }) => ({
                url: `training-data/${id}/`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["TrainingData", "AuditLog"],
        }),
        deleteTrainingData: builder.mutation({
            query: (id: number | string) => ({
                url: `training-data/${id}/`,
                method: "DELETE",
            }),
            invalidatesTags: ["TrainingData", "AuditLog"],
        }),
        seedTrainingData: builder.mutation({
            query: (data) => ({
                url: "training-data/seed/",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["TrainingData", "AuditLog"],
        }),
    }),
});

export const {
    useGetTrainingDataQuery,
    useGetTrainingDataByIdQuery,
    useCreateTrainingDataMutation,
    useUpdateTrainingDataMutation,
    useDeleteTrainingDataMutation,
    useSeedTrainingDataMutation,
} = trainingDataApi;
