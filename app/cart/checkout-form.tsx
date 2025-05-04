"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { createOrder } from "@/lib/actions/order-actions"
import { useRouter } from "next/navigation"
import PayPalButton from "@/components/paypal-button"
import { Separator } from "@/components/ui/separator"
import { Card } from "@/components/ui/card"

export default function CheckoutForm({ cartTotal }: { cartTotal: number }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [shippingAddress, setShippingAddress] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("credit_card")
  const [paymentStep, setPaymentStep] = useState<"details" | "payment">("details")
  const [paypalOrderId, setPaypalOrderId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleContinueToPayment = (e: React.FormEvent) => {
    e.preventDefault()

    if (!shippingAddress) {
      setError("Please enter your shipping address")
      return
    }

    setError(null)
    setPaymentStep("payment")
  }

  const handlePaypalSuccess = async (details: any) => {
    setPaypalOrderId(details.id)
    await handleSubmitOrder({
      paymentMethod: "paypal",
      paymentId: details.id,
      paymentStatus: details.status,
    })
  }

  const handleSubmitOrder = async (paymentDetails?: any) => {
    setIsLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append("shippingAddress", shippingAddress)
    formData.append("paymentMethod", paymentDetails?.paymentMethod || paymentMethod)

    if (paymentDetails?.paymentId) {
      formData.append("paymentId", paymentDetails.paymentId)
    }

    if (paymentDetails?.paymentStatus) {
      formData.append("paymentStatus", paymentDetails.paymentStatus)
    }

    try {
      const result = await createOrder(formData)

      if (result.error) {
        setError(result.error)
        setIsLoading(false)
        return
      }

      router.push(`/orders?success=true`)
    } catch (error) {
      setError("Failed to place order. Please try again.")
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSubmitOrder()
  }

  return (
    <div className="w-full space-y-4">
      {error && <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-3 mb-4">{error}</div>}

      {paymentStep === "details" ? (
        <form onSubmit={handleContinueToPayment} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="shippingAddress">Shipping Address</Label>
            <Input
              id="shippingAddress"
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Payment Method</Label>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
              <div className="flex items-center space-x-2 border rounded-md p-3">
                <RadioGroupItem value="credit_card" id="credit_card" />
                <Label htmlFor="credit_card" className="flex-1">
                  Credit Card
                </Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-md p-3">
                <RadioGroupItem value="paypal" id="paypal" />
                <Label htmlFor="paypal" className="flex-1">
                  PayPal
                </Label>
                <img src="/placeholder.svg?height=24&width=80&text=PayPal" alt="PayPal" className="h-6" />
              </div>
              <div className="flex items-center space-x-2 border rounded-md p-3">
                <RadioGroupItem value="cash_on_delivery" id="cash_on_delivery" />
                <Label htmlFor="cash_on_delivery" className="flex-1">
                  Cash on Delivery
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
            Continue to Payment
          </Button>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-md">
            <h3 className="font-medium mb-2">Order Summary</h3>
            <div className="flex justify-between text-sm mb-1">
              <span>Shipping Address:</span>
              <span className="font-medium">{shippingAddress}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Payment Method:</span>
              <span className="font-medium capitalize">{paymentMethod}</span>
            </div>
          </div>

          <Separator />

          {paymentMethod === "paypal" ? (
            <Card className="p-4">
              <h3 className="font-medium mb-4 text-center">Pay with PayPal</h3>
              <PayPalButton amount={cartTotal} onSuccess={handlePaypalSuccess} />
            </Card>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {paymentMethod === "credit_card" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiryDate">Expiry Date</Label>
                      <Input id="expiryDate" placeholder="MM/YY" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input id="cvv" placeholder="123" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nameOnCard">Name on Card</Label>
                    <Input id="nameOnCard" placeholder="John Doe" />
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : `Pay ${cartTotal.toFixed(2)} Rs.`}
              </Button>

              <Button type="button" variant="outline" className="w-full" onClick={() => setPaymentStep("details")}>
                Back to Details
              </Button>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
