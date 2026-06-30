"use client";

import LiveProfilePage from "@/components/account/LiveProfilePage";

export default function AdminProfilePage() {
    return (
        <LiveProfilePage
            heading="Admin Profile"
            description="Update the authenticated admin account using the live auth backend."
        />
    );
}
