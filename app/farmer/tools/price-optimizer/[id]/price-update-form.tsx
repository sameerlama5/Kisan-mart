"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { updateProductPrice } from "@/lib/actions/product-actions"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface PriceUpdateFormProps {
  productId: string
  currentPrice: number
  recommendedPrice: number
}

export function PriceUpdateForm({ productId, currentPrice, recommendedPrice }: PriceUpdateFormProps) {
  const [newPrice, setNewPrice] = useState(recommendedPrice.toString())
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const price = Number.parseFloat(newPrice)
    if (isNaN(price) || price <= 0) {
      toast.error("Please enter a valid price")
      return
    }

    setIsLoading(true)

    try {
      const result = await updateProductPrice(productId, price)

      if (result.success) {
        toast.success("Price updated successfully!")
        router.refresh()
      } else {
        toast.error(result.error || "Failed to update price")
      }
    } catch (error) {
      console.error("Price update error:", error)
      toast.error("Failed to update price")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update Product Price</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="currentPrice">Current Price</Label>
              <Input id="currentPrice" type="number" value={currentPrice} disabled className="bg-gray-50" />
            </div>
            <div>
              <Label htmlFor="newPrice">New Price (Rs.)</Label>
              <Input
                id="newPrice"
                type="number"
                step="0.01"
                min="0.01"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                placeholder="Enter new price"
                required
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
            className="text-primary"
              type="button"
              variant="outline"
              onClick={() => setNewPrice(recommendedPrice.toString())}
              disabled={isLoading}
            >
              Use Recommended Price
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Price"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
