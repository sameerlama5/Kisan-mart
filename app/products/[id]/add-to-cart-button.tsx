"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ShoppingCart, Check } from "lucide-react"
import { addToCart } from "@/lib/actions/cart-actions"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function AddToCartButton({ productId }: { productId: string }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleAddToCart = async () => {
    if (!session) {
      router.push(`/login?callbackUrl=/products/${productId}`)
      return
    }

    if (session.user.role !== "user") {
      alert("Only customers can add products to cart")
      return
    }

    setIsLoading(true)

    try {
      const result = await addToCart(productId, quantity)

      if (result.error) {
        alert(result.error)
        setIsLoading(false)
        return
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
    } catch (error) {
      alert("Failed to add product to cart")
    } finally {
      setIsLoading(false)
    }
  }

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  const increaseQuantity = () => {
    setQuantity(quantity + 1)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={decreaseQuantity}>
          -
        </Button>
        <Input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(Number.parseInt(e.target.value) || 1)}
          className="w-20 text-center"
        />
        <Button variant="outline" size="icon" onClick={increaseQuantity}>
          +
        </Button>
      </div>
      <Button
        className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
        onClick={handleAddToCart}
        disabled={isLoading || success}
      >
        {isLoading ? (
          "Adding to Cart..."
        ) : success ? (
          <>
            <Check className="mr-2 h-4 w-4" /> Added to Cart
          </>
        ) : (
          <>
            <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
          </>
        )}
      </Button>
    </div>
  )
}
