import type React from "react"
import { DashboardSidebar } from "@/components/dashboard/sidebar"

interface ShellProps {
  children: React.ReactNode
}

export function Shell({ children }: ShellProps) {
  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />
      <main className="flex-1 p-6 lg:p-8">{children}</main>
    </div>
  )
}
