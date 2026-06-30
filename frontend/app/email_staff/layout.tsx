"use client";
import { Suspense } from "react";
import Navbar from "@/components/email_staff/Navbar";
import SideBar from "@/components/email_staff/Sidebar";

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <div className="flex flex-row w-full min-h-screen lg:w-[90%] bg-none">
            <SideBar />
            <div className="flex flex-col ml-auto w-full lg:w-[78%]">
                <Suspense fallback={<div className="h-20 bg-white" />}>
                    <Navbar onSearch={() => {}} />
                </Suspense>
                {children}
            </div>
        </div>
    );
}
