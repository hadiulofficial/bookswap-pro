import type React from "react"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
// Import the debug component
import { DebugAuth } from "@/components/debug-auth"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Add the DebugAuth component to the layout
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex min-h-screen">
        <DashboardSidebar />
        <div className="flex flex-col flex-1">
          <DashboardHeader />
          <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
        </div>
      </div>
      <DebugAuth />
    </div>
  )
}
