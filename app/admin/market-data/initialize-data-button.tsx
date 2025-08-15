"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Database } from "lucide-react"
import { initializeDefaultMarketData } from "@/lib/actions/market-data-actions"
import { useToast } from "@/hooks/use-toast"

export function InitializeDataButton() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleInitialize = async () => {
    setIsLoading(true)

    try {
      const result = await initializeDefaultMarketData()

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: result.success,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initialize market data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button variant="outline" onClick={handleInitialize} disabled={isLoading}>
      <Database className="h-4 w-4 mr-2" />
      {isLoading ? "Initializing..." : "Initialize Default Data"}
    </Button>
  )
}
