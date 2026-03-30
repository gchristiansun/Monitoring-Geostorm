import { useState } from "react";
import AdminHeader from "../components/Header";
import AdminSidebar from "../components/Sidebar";
import type { PropsWithChildren } from "react";

export default function Layout({ children }: PropsWithChildren) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <AdminHeader onMenuClick={() => setSidebarOpen(true)} />

      {/* Main */}
      <div className="flex">
        {/* Sidebar (desktop + mobile overlay) */}
        <AdminSidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Content */}
        <main className="flex-1 min-h-screen px-4 py-6 md:px-6 md:ml-64">
          {children}
        </main>
      </div>
    </div>
  );
}