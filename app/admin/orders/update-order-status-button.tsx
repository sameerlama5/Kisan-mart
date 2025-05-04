"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { updateOrderStatus } from "@/lib/actions/order-actions"
import { useRouter } from "next/navigation"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"

type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled"

export default function UpdateOrderStatusButton({
  orderId,
  currentStatus,
}: {
  orderId: string
  currentStatus: OrderStatus
}) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleUpdateStatus = async (status: OrderStatus) => {
    if (status === currentStatus) return

    setIsLoading(true)

    try {
      const result = await updateOrderStatus(orderId, status)

      if (result.error) {
        alert(result.error)
        setIsLoading(false)
        return
      }

      router.refresh()
    } catch (error) {
      alert("Failed to update order status")
      setIsLoading(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isLoading} className="w-[140px] text-primary justify-between">
          {isLoading ? "Updating..." : "Update Status"}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem disabled={currentStatus === "pending"} onClick={() => handleUpdateStatus("pending")}>
          Pending
        </DropdownMenuItem>
        <DropdownMenuItem disabled={currentStatus === "processing"} onClick={() => handleUpdateStatus("processing")}>
          Processing
        </DropdownMenuItem>
        <DropdownMenuItem disabled={currentStatus === "shipped"} onClick={() => handleUpdateStatus("shipped")}>
          Shipped
        </DropdownMenuItem>
        <DropdownMenuItem disabled={currentStatus === "delivered"} onClick={() => handleUpdateStatus("delivered")}>
          Delivered
        </DropdownMenuItem>
        <DropdownMenuItem disabled={currentStatus === "cancelled"} onClick={() => handleUpdateStatus("cancelled")}>
          Cancelled
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
