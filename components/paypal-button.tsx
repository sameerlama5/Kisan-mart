"use client"

import { useEffect, useRef, useState } from "react"
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"

interface PayPalButtonProps {
  amount: number
  onSuccess: (details: any) => void
  currency?: string
}

export default function PayPalButton({ amount, onSuccess, currency = "USD" }: PayPalButtonProps) {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sdkReady, setSdkReady] = useState(false)
  const paypalRef = useRef<HTMLDivElement>(null)

  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "test"

  useEffect(() => {
    setIsLoading(false)
    setSdkReady(true)
  }, [])

  const createOrder = (data: any, actions: any) => {
    return actions.order.create({
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: amount.toFixed(2),
          },
        },
      ],
    })
  }

  const onApprove = (data: any, actions: any) => {
    return actions.order.capture().then((details: any) => {
      console.log("Payment successful:", details)
      onSuccess(details)
    })
  }

  const onError = (err: any) => {
    console.error("PayPal error:", err)
    setError("Payment failed. Please try again or choose another payment method.")
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div ref={paypalRef}>
      {sdkReady && (
        <PayPalScriptProvider options={{ "client-id": clientId, currency }}>
          <PayPalButtons
            style={{ layout: "vertical", color: "gold", shape: "rect", label: "pay" }}
            createOrder={createOrder}
            onApprove={onApprove}
            onError={onError}
          />
        </PayPalScriptProvider>
      )}
    </div>
  )
}
