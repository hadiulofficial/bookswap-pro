import { DashboardTitle } from "@/components/dashboard/title"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Bell } from "lucide-react"

export default function MessagesPage() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardTitle title="Messages" description="Communicate with other BookSwap users" />

      <Card className="border-2 border-dashed">
        <CardHeader className="pb-3">
          <CardTitle className="text-2xl flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-emerald-500" />
            Coming Soon
          </CardTitle>
          <CardDescription>We're working hard to bring you a seamless messaging experience</CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="flex-1">
              <p className="text-muted-foreground mb-4">The messaging feature will allow you to:</p>
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                <li>Chat directly with book owners and buyers</li>
                <li>Discuss swap details and arrange meetups</li>
                <li>Receive notifications about your conversations</li>
                <li>Share additional information about books</li>
              </ul>
            </div>
            <div className="flex-shrink-0 flex items-center justify-center">
              <div className="w-48 h-48 bg-emerald-50 rounded-full flex items-center justify-center">
                <MessageSquare className="h-24 w-24 text-emerald-200" />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-2">
          <Button variant="outline" className="w-full sm:w-auto" disabled>
            <Bell className="mr-2 h-4 w-4" />
            Get notified when available
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
