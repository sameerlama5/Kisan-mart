"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, X, Flag, AlertTriangle } from "lucide-react"
import { moderateReview } from "@/lib/actions/review-actions"
import { warnFarmer } from "@/lib/actions/warning-actions"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ReviewModerationActionsProps {
  reviewId: string
  productId: string
  currentStatus: string
}

export default function ReviewModerationActions({ reviewId, productId, currentStatus }: ReviewModerationActionsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [moderationReason, setModerationReason] = useState("")
  const [warningReason, setWarningReason] = useState("")
  const [warningSeverity, setWarningSeverity] = useState<"low" | "medium" | "high">("low")
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [isWarnDialogOpen, setIsWarnDialogOpen] = useState(false)

  const handleModerate = async (action: "approve" | "reject" | "flag") => {
    setIsLoading(true)

    try {
      const result = await moderateReview(reviewId, action, action === "reject" ? moderationReason : undefined)

      if (result.error) {
        alert(result.error)
      } else {
        alert(`Review ${action}ed successfully`)
        if (action === "reject") {
          setIsRejectDialogOpen(false)
          setModerationReason("")
        }
        router.refresh()
      }
    } catch (error) {
      alert(`Failed to ${action} review`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleWarnFarmer = async () => {
    if (!warningReason.trim()) {
      alert("Please provide a reason for the warning")
      return
    }

    setIsLoading(true)

    try {
      // First get the product to find the farmer
      const response = await fetch(`/api/products/${productId}`)
      if (!response.ok) {
        throw new Error("Failed to get product details")
      }

      const product = await response.json()

      const formData = new FormData()
      formData.append("farmerId", product.farmerId)
      formData.append("reason", warningReason)
      formData.append("severity", warningSeverity)
      formData.append("reviewId", reviewId)

      const result = await warnFarmer(formData)

      if (result.error) {
        alert(result.error)
      } else {
        alert("Warning issued to farmer successfully")
        setIsWarnDialogOpen(false)
        setWarningReason("")
        setWarningSeverity("low")
        router.refresh()
      }
    } catch (error) {
      alert("Failed to warn farmer")
    } finally {
      setIsLoading(false)
    }
  }

  if (currentStatus === "approved") {
    return (
      <div className="flex gap-2">
        <Button className="text-primary" size="sm" variant="outline" onClick={() => handleModerate("flag")} disabled={isLoading}>
          <Flag className="h-4 w-4 mr-1" />
          Flag
        </Button>

        <AlertDialog open={isWarnDialogOpen} onOpenChange={setIsWarnDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button className="text-primary" size="sm" variant="outline" disabled={isLoading}>
              <AlertTriangle className="h-4 w-4 mr-1" />
              Warn Farmer
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Warn Farmer</AlertDialogTitle>
              <AlertDialogDescription>
                Issue a warning to the farmer about this review or product quality.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="warningSeverity">Warning Severity</Label>
                <Select
                  value={warningSeverity}
                  onValueChange={(value: "low" | "medium" | "high") => setWarningSeverity(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="warningReason">Warning Reason</Label>
                <Textarea
                  id="warningReason"
                  placeholder="Explain why you are issuing this warning..."
                  value={warningReason}
                  onChange={(e) => setWarningReason(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleWarnFarmer}
                disabled={isLoading || !warningReason.trim()}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {isLoading ? "Issuing Warning..." : "Issue Warning"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    )
  }

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        onClick={() => handleModerate("approve")}
        disabled={isLoading}
        className="bg-green-600 hover:bg-green-700 text-white"
      >
        <Check className="h-4 w-4 mr-1" />
        Approve
      </Button>

      <AlertDialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <AlertDialogTrigger asChild>
          <Button size="sm" variant="destructive" disabled={isLoading}>
            <X className="h-4 w-4 mr-1" />
            Reject
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Review</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this review? Please provide a reason.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Label htmlFor="moderationReason">Reason for Rejection</Label>
            <Textarea
              id="moderationReason"
              placeholder="Please explain why this review is being rejected..."
              value={moderationReason}
              onChange={(e) => setModerationReason(e.target.value)}
              rows={3}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleModerate("reject")}
              disabled={isLoading || !moderationReason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? "Rejecting..." : "Reject Review"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isWarnDialogOpen} onOpenChange={setIsWarnDialogOpen}>
        <AlertDialogTrigger asChild>
          <Button size="sm" variant="outline" disabled={isLoading}>
            <AlertTriangle className="h-4 w-4 mr-1" />
            Warn Farmer
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Warn Farmer</AlertDialogTitle>
            <AlertDialogDescription>
              Issue a warning to the farmer about this review or product quality.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="warningSeverity">Warning Severity</Label>
              <Select
                value={warningSeverity}
                onValueChange={(value: "low" | "medium" | "high") => setWarningSeverity(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="warningReason">Warning Reason</Label>
              <Textarea
                id="warningReason"
                placeholder="Explain why you are issuing this warning..."
                value={warningReason}
                onChange={(e) => setWarningReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleWarnFarmer}
              disabled={isLoading || !warningReason.trim()}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isLoading ? "Issuing Warning..." : "Issue Warning"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
