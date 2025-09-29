"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { User, Session } from "@supabase/supabase-js"
import { supabase, clearAuthData } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
  clearAuthState: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const clearAuthState = () => {
    setUser(null)
    setSession(null)
    clearAuthData()
  }

  const signOut = async () => {
    try {
      // Clear state immediately for better UX
      clearAuthState()

      // Sign out from Supabase
      await supabase.auth.signOut()

      // Hard redirect to login page
      window.location.href = "/login"
    } catch (error) {
      console.error("Error signing out:", error)
      // Even if sign out fails, clear local state and redirect
      clearAuthState()
      window.location.href = "/login"
    }
  }

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("Error getting session:", error)
          clearAuthState()
        } else {
          setSession(session)
          setUser(session?.user ?? null)
        }
      } catch (error) {
        console.error("Exception getting session:", error)
        clearAuthState()
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email)

      if (event === "SIGNED_IN" && session) {
        setSession(session)
        setUser(session.user)
      } else if (event === "SIGNED_OUT" || !session) {
        clearAuthState()
      } else if (event === "TOKEN_REFRESHED" && session) {
        setSession(session)
        setUser(session.user)
      }

      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut, clearAuthState }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
