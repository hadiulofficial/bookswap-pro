"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

type SidebarContextType = {
  isOpen: boolean
  toggleSidebar: () => void
  closeSidebar: () => void
}

const SidebarContext = createContext<SidebarContextType>({
  isOpen: true,
  toggleSidebar: () => {},
  closeSidebar: () => {},
})

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  // Default to true on desktop, false on mobile
  const [isOpen, setIsOpen] = useState(typeof window !== "undefined" ? window.innerWidth >= 1024 : true)

  useEffect(() => {
    // Update isOpen based on window resize
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsOpen(false)
      } else {
        setIsOpen(true)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  const closeSidebar = () => {
    if (window.innerWidth < 1024) {
      setIsOpen(false)
    }
  }

  return <SidebarContext.Provider value={{ isOpen, toggleSidebar, closeSidebar }}>{children}</SidebarContext.Provider>
}

export const useSidebarToggle = () => useContext(SidebarContext)
