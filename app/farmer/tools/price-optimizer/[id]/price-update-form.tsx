"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { updateProduct } from "@/lib/actions/product-actions"
import { useRouter } from "next/navigation"
import { AlertCircle, Check } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface PriceUpdateFormProps {
  productId: string
  currentPrice: number
  recommendedPrice: number
  minPrice: number
  maxPrice: number
}

export default function PriceUpdateForm({
  productId,
  currentPrice,
  recommendedPrice,
  minPrice,
  maxPrice,
}: PriceUpdateFormProps) {
  const router = useRouter()
  const [price, setPrice] = useState(recommendedPrice.toString())
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess(false)

    const numericPrice = Number.parseFloat(price)

    if (isNaN(numericPrice) || numericPrice <= 0) {
      setError("Please enter a valid price")
      setIsLoading(false)
      return
    }

    const formData = new FormData()
    formData.append("price", price)

    try {
      const result = await updateProduct(productId, formData)

      if (result.error) {
        setError(result.error)
        setIsLoading(false)
        return
      }

      setSuccess(true)
      router.refresh()

      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(false)
      }, 3000)
    } catch (error) {
      setError("Failed to update price. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUseRecommended = () => {
    setPrice(recommendedPrice.toString())
  }

  // Check if price is outside recommended range
  const isPriceOutsideRange = Number.parseFloat(price) < minPrice || Number.parseFloat(price) > maxPrice

  return (
    <div>
      <h3 className="font-medium mb-4">Update Product Price</h3>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
          <Check className="h-4 w-4" />
          ck className="h-4 w-4" />
          <AlertDescription>Price updated successfully!</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col space-y-2">
          <label htmlFor="price" className="text-sm font-medium">
            New Price (Rs.)
          </label>
          <div className="flex gap-2">
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className={isPriceOutsideRange ? "border-orange-300" : ""}
            />
            <Button className="text-primary" type="button" variant="outline" onClick={handleUseRecommended}>
              Use Recommended
            </Button>
          </div>
          {isPriceOutsideRange && (
            <p className="text-xs text-orange-500">
              This price is outside the recommended range (Rs. {minPrice.toFixed(2)} - Rs. {maxPrice.toFixed(2)})
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Updating..." : "Update Price"}
        </Button>
      </form>
    </div>
  )
}
