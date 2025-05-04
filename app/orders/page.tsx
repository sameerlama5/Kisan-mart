import { getUserOrders } from "@/lib/actions/order-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"

export default async function OrdersPage({ searchParams }: { searchParams: { success?: string } }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login?callbackUrl=/orders")
  }

  if (session.user.role !== "user") {
    redirect("/")
  }

  const orders = await getUserOrders()
  const showSuccess = searchParams.success === "true"

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Your Orders</h1>

      {showSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-md p-4 mb-6">
          <p className="font-medium">Order placed successfully!</p>
          <p>Thank you for your purchase. Your order has been received and is being processed.</p>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-4">You haven&apos;t placed any orders yet</h2>
          <p className="text-muted-foreground mb-6">Browse our products and place your first order</p>
          <Link href="/products">
            <Button>Browse Products</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order: any) => (
            <Card key={order._id}>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle>Order #{order._id.substring(0, 8)}</CardTitle>
                    <p className="text-muted-foreground">Placed on {formatDate(order.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className="capitalize">{order.status}</Badge>
                    <div className="font-medium">Rs.{order.totalAmount.toFixed(2)}</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.products.map((item: any, index: number) => (
                    <div key={item.productId}>
                      <div className="flex justify-between">
                        <div>
                          <Link href={`/products/${item.productId}`} className="font-medium hover:underline">
                            {item.name}
                          </Link>
                          <div className="text-muted-foreground">Quantity: {item.quantity}</div>
                        </div>
                        <div className="text-right font-medium">Rs.{(item.price * item.quantity).toFixed(2)}</div>
                      </div>
                      {index < order.products.length - 1 && <Separator className="my-2" />}
                    </div>
                  ))}
                </div>

                <div className="mt-6 space-y-2">
                  <div className="font-medium">Shipping Address</div>
                  <p className="text-muted-foreground">{order.shippingAddress}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
