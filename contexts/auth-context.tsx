"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
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

  const clearAuthState = () => {
    setUser(null)
    setProfile(null)
    setSession(null)
    setIsLoading(false)
  }

  const clearAllStorage = () => {
    try {
      // Clear all Supabase related items from localStorage
      const keysToRemove = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && (key.includes("supabase") || key.includes("auth"))) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key))

      // Clear sessionStorage as well
      const sessionKeysToRemove = []
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i)
        if (key && (key.includes("supabase") || key.includes("auth"))) {
          sessionKeysToRemove.push(key)
        }
      }
      sessionKeysToRemove.forEach((key) => sessionStorage.removeItem(key))
    } catch (error) {
      console.error("Error clearing storage:", error)
    }
  }

  const fetchProfile = async (userId: string) => {
    try {
      console.log("Fetching profile for user:", userId)
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

      if (error) {
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
  }

  const refreshProfile = async () => {
    if (user) {
      return await fetchProfile(user.id)
    }
    return null
  }

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        console.log("Auth context: Session fetched", !!session)

        setSession(session)
        setUser(session?.user || null)

        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
          console.log("Auth context: No user in session")
        }

        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching session:", error)
        setIsLoading(false)
      }
    }

    fetchSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", event, !!session)

      if (event === "SIGNED_OUT" || !session) {
        clearAuthState()
        clearAllStorage()
      } else {
        setSession(session)
        setUser(session?.user || null)

        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
        }
        setIsLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    try {
      console.log("Starting sign out process...")
      setIsLoading(true)

      // Clear state immediately for better UX
      clearAuthState()
      clearAllStorage()

      // Sign out from Supabase
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error("Error signing out:", error)
      } else {
        console.log("Successfully signed out")
      }

      // Force a hard refresh to clear any cached state
      window.location.href = "/login"
    } catch (error) {
      console.error("Exception during sign out:", error)
      // Even if there's an error, clear local state and redirect
      clearAuthState()
      clearAllStorage()
      window.location.href = "/login"
    }
  }

  return (
    <AuthContext.Provider value={{ user, profile, session, isLoading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
