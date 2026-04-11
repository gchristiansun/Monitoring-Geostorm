import { useEffect, useState } from "react";
import AdminHeader from "../components/HeaderNew";
import AdminSidebar from "../components/Sidebar";
import type { PropsWithChildren } from "react";

export default function Layout({ children }: PropsWithChildren) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    return window.localStorage.getItem("theme") === "dark" ? "dark" : "light";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300">
      {/* Header */}
      <AdminHeader
        onMenuClick={() => setSidebarOpen(true)}
        theme={theme}
        onThemeToggle={() => setTheme(theme === "dark" ? "light" : "dark")}
      />

      <div className="flex">        
        <AdminSidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <main className="flex-1 min-h-screen px-4 py-6 md:px-6 md:ml-64">
          {children}
        </main>
      </div>
    </div>
  );
}