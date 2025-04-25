"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"

export function DebugAuth() {
  const { user, profile, session } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  if (!isOpen) {
    return (
      <Button variant="outline" size="sm" onClick={() => setIsOpen(true)} className="fixed bottom-4 right-4 z-50">
        Debug Auth
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 z-50 shadow-lg">
      <CardHeader>
        <CardTitle className="flex justify-between">
          Auth Debug
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
            ×
          </Button>
        </CardTitle>
        <CardDescription>Authentication status information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-xs">
        <div>
          <h3 className="font-bold mb-1">User Status:</h3>
          <pre className="bg-gray-100 p-2 rounded overflow-auto max-h-24 dark:bg-gray-800">
            {JSON.stringify(
              {
                isAuthenticated: !!user,
                userId: user?.id,
                email: user?.email,
              },
              null,
              2,
            )}
          </pre>
        </div>

        <div>
          <h3 className="font-bold mb-1">Profile Status:</h3>
          <pre className="bg-gray-100 p-2 rounded overflow-auto max-h-24 dark:bg-gray-800">
            {JSON.stringify(
              {
                hasProfile: !!profile,
                username: profile?.username,
                fullName: profile?.full_name,
              },
              null,
              2,
            )}
          </pre>
        </div>

        <div>
          <h3 className="font-bold mb-1">Session Status:</h3>
          <pre className="bg-gray-100 p-2 rounded overflow-auto max-h-24 dark:bg-gray-800">
            {JSON.stringify(
              {
                hasSession: !!session,
                expiresAt: session?.expires_at,
              },
              null,
              2,
            )}
          </pre>
        </div>
      </CardContent>
    </Card>
  )
}
