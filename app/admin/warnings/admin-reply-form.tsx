"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Reply, Send } from "lucide-react"
import { replyToFarmerResponse } from "@/lib/actions/warning-actions"
import { useRouter } from "next/navigation"

interface AdminReplyFormProps {
  warningId: string
}

export default function AdminReplyForm({ warningId }: AdminReplyFormProps) {
  const router = useRouter()
  const [adminReply, setAdminReply] = useState("")
  const [newStatus, setNewStatus] = useState<"active" | "resolved" | "under_review">("active")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!adminReply.trim()) {
      alert("Please provide a reply message")
      return
    }

    setIsSubmitting(true)

    const formData = new FormData()
    formData.append("warningId", warningId)
    formData.append("adminReply", adminReply)
    formData.append("newStatus", newStatus)

    try {
      const result = await replyToFarmerResponse(formData)

      if (result.error) {
        alert(result.error)
      } else {
        alert("Reply sent successfully!")
        setShowForm(false)
        setAdminReply("")
        router.refresh()
      }
    } catch (error) {
      alert("Failed to send reply")
    } finally {
      setIsSubmitting(false)
    }
  }

  const statusDescriptions = {
    active: "Keep the warning active - farmer needs to take more action",
    resolved: "Mark as resolved - farmer has adequately addressed the concerns",
    under_review: "Keep under review - need more information or time to evaluate",
  }

  if (!showForm) {
    return (
      <div className="mt-4">
        <Button onClick={() => setShowForm(true)} variant="outline" className="w-full">
          <Reply className="h-4 w-4 mr-2" />
          Reply to Farmer
        </Button>
      </div>
    )
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Reply className="h-5 w-5" />
          Reply to Farmer Response
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="newStatus">Warning Status After Reply</Label>
            <Select
              value={newStatus}
              onValueChange={(value: "active" | "resolved" | "under_review") => setNewStatus(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Keep Active</SelectItem>
                <SelectItem value="resolved">Mark as Resolved</SelectItem>
                <SelectItem value="under_review">Keep Under Review</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground mt-1">{statusDescriptions[newStatus]}</p>
          </div>

          <div>
            <Label htmlFor="adminReply">Your Reply *</Label>
            <Textarea
              id="adminReply"
              value={adminReply}
              onChange={(e) => setAdminReply(e.target.value)}
              placeholder={
                newStatus === "resolved"
                  ? "Thank you for your response. We are satisfied with your explanation/action plan and consider this matter resolved..."
                  : newStatus === "active"
                    ? "Thank you for your response. However, we need you to take additional actions to address our concerns..."
                    : "Thank you for your response. We are reviewing your submission and will get back to you with further instructions..."
              }
              rows={4}
              required
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? "Sending..." : "Send Reply"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
