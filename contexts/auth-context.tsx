"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react"
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
  const isInitialized = useRef(false)

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching profile:", error)
        return null
      }

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
    async (event: string, newSession: Session | null) => {
      console.log("Auth state change:", event)

      setSession(newSession)
      setUser(newSession?.user || null)

      if (newSession?.user) {
        // Only fetch profile if we don't have it or if it's a different user
        if (!profile || profile.id !== newSession.user.id) {
          await fetchProfile(newSession.user.id)
        }

        // Redirect to dashboard only on SIGNED_IN event
        if (event === "SIGNED_IN" && (pathname === "/login" || pathname === "/signup")) {
          router.replace("/dashboard")
        }
      } else {
        setProfile(null)

        // Redirect to home only on SIGNED_OUT event
        if (event === "SIGNED_OUT" && pathname?.startsWith("/dashboard")) {
          router.replace("/")
        }
      }

      setIsLoading(false)
    },
    [fetchProfile, pathname, router, profile],
  )

  useEffect(() => {
    // Prevent multiple initializations
    if (isInitialized.current) return

    let mounted = true

    const initializeAuth = async () => {
      try {
        // Get initial session with a timeout
        const sessionPromise = supabase.auth.getSession()
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Session fetch timeout")), 5000),
        )

        const {
          data: { session },
          error,
        } = (await Promise.race([sessionPromise, timeoutPromise])) as any

        if (error) {
          console.error("Error getting session:", error)
          if (mounted) {
            setIsLoading(false)
          }
          return
        }

        if (mounted) {
          setSession(session)
          setUser(session?.user || null)

          // Fetch profile in parallel without blocking
          if (session?.user) {
            fetchProfile(session.user.id).catch(console.error)
          }

          setIsLoading(false)
          isInitialized.current = true
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
        if (mounted) {
          setIsLoading(false)
          isInitialized.current = true
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
      setIsLoading(true)

      // Clear state immediately for better UX
      setUser(null)
      setProfile(null)
      setSession(null)

      // Sign out from Supabase
      await supabase.auth.signOut()

      // Clear cached data
      if (typeof window !== "undefined") {
        localStorage.removeItem("supabase.auth.token")
        sessionStorage.clear()
      }

      // Redirect to home page
      router.replace("/")
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
