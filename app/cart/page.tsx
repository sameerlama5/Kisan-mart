import { getCart } from "@/lib/actions/cart-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import CartItemActions from "./cart-item-actions"
import CheckoutForm from "./checkout-form"
import { authOptions } from "@/lib/auth"

export default async function CartPage() {
  // Check authentication and role
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login?callbackUrl=/cart")
  }

  if (session.user.role !== "user") {
    redirect("/")
  }

  const cart = await getCart()

  const totalItems = cart?.products?.length || 0
  const subtotal = cart?.products?.reduce((total: number, item: any) => total + item.price * item.quantity, 0) || 0

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>

      {!cart || cart.products.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">Add some products to your cart to continue shopping</p>
          <Link href="/products">
            <Button>Browse Products</Button>
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Cart Items ({totalItems})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {cart.products.map((item: any, index: number) => (
                  <div key={item.productId}>
                    <div className="flex items-center p-4 gap-4">
                      <div className="relative h-20 w-20 rounded overflow-hidden">
                      <img
                        src={item.images || "/placeholder.svg"}
                       alt={item.name}
                        className="object-cover w-full h-full"
                     />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link href={`/products/${item.productId}`} className="font-medium hover:underline">
                          {item.name}
                        </Link>
                        <div className="text-muted-foreground">Rs.{item.price.toFixed(2)} per Kg.</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">Rs.{(item.price * item.quantity).toFixed(2)}</div>
                        <CartItemActions productId={item.productId} quantity={item.quantity} />
                      </div>
                    </div>
                    {index < cart.products.length - 1 && <Separator />}
                  </div>
                ))}
              </CardContent>
              <CardFooter className="flex justify-between px-4 pb-6">
                <Link href="/products">
                  <Button className="text-primary" variant="outline">Continue Shopping</Button>
                </Link>
              </CardFooter>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>Rs.{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium text-lg">
                  <span>Total</span>
                  <span>Rs{subtotal.toFixed(2)}</span>
                </div>
              </CardContent>
              <CardFooter>
                <CheckoutForm cartTotal={subtotal} />
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
