import AdminHeader from "../components/Header";
import AdminSidebar from "../components/Sidebar";
import type { PropsWithChildren } from "react";

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div >      
      {/* Header */}
      <AdminHeader />

      {/* Main */}
      <div className="flex h-full bg-gray-100"> 


        <div className="w-80">
          {/* Sidebar */}
          <AdminSidebar />
        </div>
       

        {/* Content */}
        <main className="p-6 w-full min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}