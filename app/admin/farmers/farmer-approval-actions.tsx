"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"
import { approveFarmer, rejectFarmer } from "@/lib/actions/farmer-approval-actions"
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

export default function FarmerApprovalActions({
  farmerId,
  farmerName,
}: {
  farmerId: string
  farmerName: string
}) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)

  const handleApprove = async () => {
    setIsLoading(true)

    try {
      const result = await approveFarmer(farmerId)

      if (result.error) {
        alert(result.error)
        setIsLoading(false)
        return
      }

      alert("Farmer approved successfully!")
      router.refresh()
    } catch (error) {
      alert("Failed to approve farmer")
      setIsLoading(false)
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a reason for rejection")
      return
    }

    setIsLoading(true)

    try {
      const result = await rejectFarmer(farmerId, rejectionReason)

      if (result.error) {
        alert(result.error)
        setIsLoading(false)
        return
      }

      alert("Farmer rejected successfully!")
      setIsRejectDialogOpen(false)
      setRejectionReason("")
      router.refresh()
    } catch (error) {
      alert("Failed to reject farmer")
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        onClick={handleApprove}
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
            <AlertDialogTitle>Reject Farmer Application</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject {farmerName}&apos;s application? Please provide a reason for rejection.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Label htmlFor="rejectionReason">Reason for Rejection</Label>
            <Textarea
              id="rejectionReason"
              placeholder="Please explain why this application is being rejected..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              disabled={isLoading || !rejectionReason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? "Rejecting..." : "Reject Application"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
