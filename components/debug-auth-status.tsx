"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { checkAuthStatus } from "@/app/actions/auth-actions"
import { Loader2 } from "lucide-react"

export function DebugAuthStatus() {
  const [isChecking, setIsChecking] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [isOpen, setIsOpen] = useState(false)

  const handleCheck = async () => {
    setIsChecking(true)
    try {
      const status = await checkAuthStatus()
      setResult(status)
    } catch (error) {
      setResult({ error: String(error) })
    } finally {
      setIsChecking(false)
    }
  }

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-50 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 border-yellow-300"
      >
        Debug Auth Status
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-4 left-4 w-96 z-50 shadow-lg">
      <CardHeader>
        <CardTitle className="flex justify-between">
          Auth Status Debug
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
            ×
          </Button>
        </CardTitle>
        <CardDescription>Check server-side authentication status</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleCheck} disabled={isChecking} className="w-full">
          {isChecking ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Checking...
            </>
          ) : (
            "Check Auth Status"
          )}
        </Button>

        {result && (
          <div className="mt-4">
            <h3 className="font-bold mb-1">Result:</h3>
            <pre className="bg-gray-100 p-2 rounded overflow-auto max-h-64 text-xs dark:bg-gray-800">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
