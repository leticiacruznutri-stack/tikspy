"use client";

import { useState } from "react";
import { Sidebar, MobileMenuButton } from "./Sidebar";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAF7F2]">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <MobileMenuButton onClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 pt-16 lg:p-8 lg:pt-8">
          {children}
        </main>
      </div>
    </div>
  );
}
