"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import type { User, Session } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase/database.types"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]

type AuthContextType = {
  user: User | null
  profile: Profile | null
  session: Session | null
  isLoading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  session: null,
  isLoading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      console.log("Fetching profile for user:", userId)
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching profile:", error)
        return null
      }

      console.log("Profile data:", data)
      setProfile(data)
      return data
    } catch (error) {
      console.error("Exception fetching profile:", error)
      return null
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    if (user) {
      return await fetchProfile(user.id)
    }
    return null
  }, [user, fetchProfile])

  const handleAuthStateChange = useCallback(
    async (event: string, session: Session | null) => {
      console.log("Auth state change:", event, !!session)

      setSession(session)
      setUser(session?.user || null)

      if (session?.user) {
        await fetchProfile(session.user.id)

        // If user just signed in and is on login/signup page, redirect to dashboard
        if (event === "SIGNED_IN" && (pathname === "/login" || pathname === "/signup")) {
          console.log("Redirecting to dashboard after sign in")
          router.push("/dashboard")
        }
      } else {
        setProfile(null)

        // If user signed out and is on a protected route, redirect to home
        if (event === "SIGNED_OUT" && pathname?.startsWith("/dashboard")) {
          console.log("Redirecting to home after sign out")
          router.push("/")
        }
      }

      setIsLoading(false)
    },
    [fetchProfile, pathname, router],
  )

  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        // Get initial session
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("Error getting session:", error)
          setIsLoading(false)
          return
        }

        if (mounted) {
          console.log("Initial session:", !!session)
          setSession(session)
          setUser(session?.user || null)

          if (session?.user) {
            await fetchProfile(session.user.id)
          } else {
            setProfile(null)
          }

          setIsLoading(false)
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(handleAuthStateChange)

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [fetchProfile, handleAuthStateChange])

  const signOut = useCallback(async () => {
    try {
      console.log("Signing out...")
      setIsLoading(true)

      // Clear state immediately
      setUser(null)
      setProfile(null)
      setSession(null)

      // Sign out from Supabase
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error("Error signing out:", error)
      }

      // Clear any cached data
      if (typeof window !== "undefined") {
        localStorage.removeItem("supabase.auth.token")
        sessionStorage.clear()
      }

      // Redirect to home page
      router.push("/")
    } catch (error) {
      console.error("Exception during sign out:", error)
    } finally {
      setIsLoading(false)
    }
  }, [router])

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        isLoading,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
