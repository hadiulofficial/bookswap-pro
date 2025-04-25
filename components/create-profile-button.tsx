"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { createUserProfile } from "@/app/actions/profile-actions"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, UserPlus, AlertCircle } from "lucide-react"

export function CreateProfileButton() {
  const { user, profile, refreshProfile } = useAuth()
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleCreateProfile = async () => {
    if (!user || profile) return

    setIsCreating(true)
    setError(null)
    setSuccess(false)

    try {
      const result = await createUserProfile()

      if (result.success) {
        setSuccess(true)
        await refreshProfile()
      } else {
        setError(result.error || "Failed to create profile")
      }
    } catch (err: any) {
      console.error("Error creating profile:", err)
      setError(err.message || "An unexpected error occurred")
    } finally {
      setIsCreating(false)
    }
  }

  if (!user || profile || success) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {error && (
        <Alert variant="destructive" className="mb-2 max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Button onClick={handleCreateProfile} disabled={isCreating}>
        {isCreating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Profile...
          </>
        ) : (
          <>
            <UserPlus className="mr-2 h-4 w-4" /> Create Profile
          </>
        )}
      </Button>
    </div>
  )
}
