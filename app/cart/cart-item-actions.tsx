"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash } from "lucide-react"
import { updateCartItem } from "@/lib/actions/cart-actions"
import { useRouter } from "next/navigation"

export default function CartItemActions({ productId, quantity }: { productId: string; quantity: number }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleUpdateQuantity = async (newQuantity: number) => {
    setIsLoading(true)

    try {
      await updateCartItem(productId, newQuantity)
      router.refresh()
    } catch (error) {
      console.error("Failed to update cart", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemove = () => handleUpdateQuantity(0)

  return (
    <div className="flex items-center gap-2 mt-1">
      <Button
      className="text-accent"
        variant="outline"
        size="icon"
        onClick={() => handleUpdateQuantity(quantity - 1)}
        disabled={quantity <= 1 || isLoading}
      >
        -
      </Button>
      <span className="w-8 text-center">{quantity}</span>
      <Button className="text-primary" variant="outline" size="icon" onClick={() => handleUpdateQuantity(quantity + 1)} disabled={isLoading}>
        +
      </Button>
      <Button variant="outline" size="icon" onClick={handleRemove} disabled={isLoading}>
        <Trash className="h-4 w-4 text-primary" />
      </Button>
    </div>
  )
}
