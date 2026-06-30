import { apiSlice } from "./ApiSlice";

export type LoginPayload = {
    email: string;
    password: string;
};

export type RegisterPayload = {
    username: string;
    email: string;
    password: string;
    role?: string;
    is_active?: boolean;
};

export type UpdateProfilePayload = FormData | {
    username?: string;
    current_password?: string;
    new_password?: string;
    is_active?: boolean;
    email_notifications?: boolean;
    in_app_notifications?: boolean;
    auto_approve_high_confidence?: boolean;
    two_factor_enabled?: boolean;
};

export type CurrentUser = {
    id: number;
    username: string;
    email: string;
    role: string;
    profile_picture?: string | null;
    is_active: boolean;
    email_notifications?: boolean;
    in_app_notifications?: boolean;
    auto_approve_high_confidence?: boolean;
    two_factor_enabled?: boolean;
};

const authApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation({
            query: (data: LoginPayload) => ({ url: "auth/login/", method: "POST", body: data }),
            invalidatesTags: ["Auth"],
        }),
        register: builder.mutation({
            query: (data: RegisterPayload) => ({ url: "auth/register/", method: "POST", body: data }),
        }),
        createUser: builder.mutation({
            query: (data) => ({ url: "auth/admin/users/create/", method: "POST", body: data }),
            invalidatesTags: ["Auth", "AuditLog"],
        }),
        updateProfile: builder.mutation({
            query: (data: UpdateProfilePayload) => ({
                url: "auth/update-profile/",
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["Auth"],
        }),
        forgotPassword: builder.mutation({
            query: (data) => ({ url: "auth/forgot-password/", method: "POST", body: data }),
        }),
        resetPassword: builder.mutation({
            query: (data) => ({ url: "auth/reset-password/", method: "POST", body: data }),
        }),
        getAllUsers: builder.query<CurrentUser[], void>({
            query: () => ({ url: "auth/users/", method: "GET" }),
            transformResponse: (response: { results?: CurrentUser[] } | CurrentUser[]) =>
                Array.isArray(response) ? response : response?.results ?? [],
            providesTags: ["Auth"],
        }),
        getMyDetails: builder.mutation<CurrentUser, void>({
            query: () => ({ url: "auth/me/", method: "GET" }),
            invalidatesTags: ["Auth"],
        }),
        updateUser: builder.mutation({
            query: ({ id, data }) => ({
                url: `auth/admin/users/${id}/update/`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["Auth", "AuditLog"],
        }),
        deleteUser: builder.mutation({
            query: (id) => ({ url: `auth/admin/users/${id}/delete/`, method: "DELETE" }),
            invalidatesTags: ["Auth", "AuditLog"],
        }),
        toggleUserActive: builder.mutation({
            query: (id) => ({ url: `auth/admin/users/${id}/toggle-active/`, method: "PATCH" }),
            invalidatesTags: ["Auth", "AuditLog"],
        }),
        getCurrentUser: builder.query<CurrentUser, void>({
            query: () => ({ url: "auth/me/", method: "GET" }),
            providesTags: ["Auth"],
        }),
    }),
});

export const {
    useLoginMutation,
    useForgotPasswordMutation,
    useResetPasswordMutation,
    useRegisterMutation,
    useUpdateProfileMutation,
    useGetAllUsersQuery,
    useGetMyDetailsMutation,
    useCreateUserMutation,
    useUpdateUserMutation,
    useDeleteUserMutation,
    useToggleUserActiveMutation,
    useGetCurrentUserQuery,
} = authApi;
