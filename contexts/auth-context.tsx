"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import type { User, Session, AuthChangeEvent } from "@supabase/supabase-js"
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
  const profileCache = useRef<Map<string, Profile>>(new Map())

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      // Check cache first
      if (profileCache.current.has(userId)) {
        const cachedProfile = profileCache.current.get(userId)!
        setProfile(cachedProfile)
        return cachedProfile
      }

      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching profile:", error)
        return null
      }

      if (data) {
        profileCache.current.set(userId, data)
        setProfile(data)
      }

      return data
    } catch (error) {
      console.error("Exception fetching profile:", error)
      return null
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    if (user) {
      // Clear cache for this user
      profileCache.current.delete(user.id)
      return await fetchProfile(user.id)
    }
    return null
  }, [user, fetchProfile])

  const handleAuthStateChange = useCallback(
    async (event: AuthChangeEvent, newSession: Session | null) => {
      console.log("Auth state change:", event, "Has session:", !!newSession)

      setSession(newSession)
      setUser(newSession?.user || null)

      if (newSession?.user) {
        // Fetch profile without blocking
        fetchProfile(newSession.user.id)

        // Only redirect on specific auth events
        if (event === "SIGNED_IN") {
          const isAuthPage = pathname === "/login" || pathname === "/signup"
          if (isAuthPage) {
            console.log("Redirecting to dashboard after sign in")
            setTimeout(() => router.replace("/dashboard"), 100)
          }
        }
      } else {
        setProfile(null)
        profileCache.current.clear()

        // Redirect to home on sign out if on protected route
        if (event === "SIGNED_OUT" && pathname?.startsWith("/dashboard")) {
          console.log("Redirecting to home after sign out")
          setTimeout(() => router.replace("/"), 100)
        }
      }

      setIsLoading(false)
    },
    [fetchProfile, pathname, router],
  )

  useEffect(() => {
    // Prevent multiple initializations
    if (isInitialized.current) return

    let mounted = true
    isInitialized.current = true

    const initializeAuth = async () => {
      try {
        console.log("Initializing auth...")

        // Get session with timeout
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 3000))

        const sessionPromise = supabase.auth.getSession()

        const result = await Promise.race([sessionPromise, timeoutPromise])
        const { data, error } = result as any

        if (error) {
          console.error("Error getting session:", error)
          if (mounted) setIsLoading(false)
          return
        }

        if (mounted) {
          const currentSession = data.session
          console.log("Initial session found:", !!currentSession)

          setSession(currentSession)
          setUser(currentSession?.user || null)

          // Fetch profile without blocking
          if (currentSession?.user) {
            fetchProfile(currentSession.user.id)
          }

          setIsLoading(false)
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
        if (mounted) setIsLoading(false)
      }
    }

    initializeAuth()

    // Set up auth state listener
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
      profileCache.current.clear()

      // Sign out from Supabase
      await supabase.auth.signOut()

      // Clear storage
      if (typeof window !== "undefined") {
        localStorage.removeItem("supabase.auth.token")
        sessionStorage.clear()
      }

      // Redirect
      router.replace("/")
    } catch (error) {
      console.error("Error signing out:", error)
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
