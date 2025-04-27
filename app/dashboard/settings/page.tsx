"use client"

import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardTitle } from "@/components/dashboard/title"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"
import { useState, useEffect } from "react"
import { toast } from "@/components/ui/use-toast"

export default function SettingsPage() {
  const { user } = useAuth()
  const { theme, setTheme } = useTheme()
  const [selectedTheme, setSelectedTheme] = useState<string>(theme)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setSelectedTheme(theme)
  }, [theme])

  if (!user) return null

  const handleSaveSettings = () => {
    setIsSaving(true)

    // Save theme
    setTheme(selectedTheme as "light" | "dark" | "system")

    // Show success message
    toast({
      title: "Settings saved",
      description: "Your settings have been saved successfully.",
    })

    setIsSaving(false)
  }

  return (
    <div className="space-y-6">
      <DashboardTitle title="Settings" description="Manage your account settings and preferences" />

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Manage your general account settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Theme</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Choose your preferred theme</p>
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="light"
                      name="theme"
                      value="light"
                      checked={selectedTheme === "light"}
                      onChange={() => setSelectedTheme("light")}
                    />
                    <Label htmlFor="light">Light</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="dark"
                      name="theme"
                      value="dark"
                      checked={selectedTheme === "dark"}
                      onChange={() => setSelectedTheme("dark")}
                    />
                    <Label htmlFor="dark">Dark</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="system"
                      name="theme"
                      value="system"
                      checked={selectedTheme === "system"}
                      onChange={() => setSelectedTheme("system")}
                    />
                    <Label htmlFor="system">System</Label>
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveSettings} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Control how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifications" className="font-medium">
                      Email Notifications
                    </Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Receive updates via email</p>
                  </div>
                  <Switch id="email-notifications" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="swap-requests" className="font-medium">
                      Swap Requests
                    </Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Get notified about new swap requests</p>
                  </div>
                  <Switch id="swap-requests" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="messages" className="font-medium">
                      Messages
                    </Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Get notified about new messages</p>
                  </div>
                  <Switch id="messages" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="wishlist" className="font-medium">
                      Wishlist Matches
                    </Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Get notified when books on your wishlist become available
                    </p>
                  </div>
                  <Switch id="wishlist" defaultChecked />
                </div>
              </div>

              <Button>Save Notification Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>Control your privacy preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="public-profile" className="font-medium">
                      Public Profile
                    </Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Allow others to view your profile</p>
                  </div>
                  <Switch id="public-profile" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="show-location" className="font-medium">
                      Show Location
                    </Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Display your location on your profile</p>
                  </div>
                  <Switch id="show-location" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="show-email" className="font-medium">
                      Show Email
                    </Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Display your email to other users</p>
                  </div>
                  <Switch id="show-email" />
                </div>
              </div>

              <Button>Save Privacy Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
