"use client";
import Navbar from "@/components/admin/Navbar";
import AdminSideBar from "@/components/admin/Sidebar";

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <div className="flex flex-row w-full min-h-screen lg:w-[90%] bg-none">
            <AdminSideBar />
            <div className="flex flex-col ml-auto w-full lg:w-[78%]">
                <Navbar onSearch={() => {}} />
                {children}
            </div>
        </div>
    );
}
