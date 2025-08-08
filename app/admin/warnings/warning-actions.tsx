"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { resolveWarning } from "@/lib/actions/warning-actions"
import { useRouter } from "next/navigation"

export default function WarningActions({ warningId }: { warningId: string }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleResolve = async () => {
    setIsLoading(true)

    try {
      const result = await resolveWarning(warningId)

      if (result.error) {
        alert(result.error)
      } else {
        alert("Warning resolved successfully")
        router.refresh()
      }
    } catch (error) {
      alert("Failed to resolve warning")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      size="sm"
      onClick={handleResolve}
      disabled={isLoading}
      className="bg-green-600 hover:bg-green-700 text-white"
    >
      <Check className="h-4 w-4 mr-1" />
      {isLoading ? "Resolving..." : "Mark Resolved"}
    </Button>
  )
}
