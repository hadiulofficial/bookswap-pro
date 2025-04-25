"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { createUserProfile } from "@/app/actions/profile-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, UserPlus, AlertCircle } from "lucide-react"

export function ProfileCreator() {
  const { user, profile, refreshProfile } = useAuth()
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAutoCreating, setIsAutoCreating] = useState(false)

  // Auto-create profile on component mount if user exists but profile doesn't
  useEffect(() => {
    const autoCreateProfile = async () => {
      if (user && !profile && !isAutoCreating) {
        setIsAutoCreating(true)
        try {
          const result = await createUserProfile()
          if (result.success) {
            await refreshProfile()
          }
        } catch (err) {
          console.error("Error auto-creating profile:", err)
        } finally {
          setIsAutoCreating(false)
        }
      }
    }

    autoCreateProfile()
  }, [user, profile, refreshProfile, isAutoCreating])

  const handleCreateProfile = async () => {
    setIsCreating(true)
    setError(null)

    try {
      const result = await createUserProfile()

      if (result.success) {
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

  if (!user || profile) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Complete Your Profile</CardTitle>
          <CardDescription>
            We need to create a profile for you before you can use all features of BookSwap
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Your profile will be created with information from your Google account. You can update your profile details
            later.
          </p>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleCreateProfile} disabled={isCreating || isAutoCreating}>
            {isCreating || isAutoCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Profile...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" /> Create Profile
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
