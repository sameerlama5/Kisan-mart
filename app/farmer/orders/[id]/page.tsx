import { getOrderById } from "@/lib/actions/order-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { getProducts } from "@/lib/actions/product-actions"
import UpdateOrderStatusButton from "../update-order-status-button"

export default async function FarmerOrderDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login?callbackUrl=/farmer/orders")
  }

  if (session.user.role !== "farmer") {
    redirect("/")
  }

  const order = await getOrderById(params.id)

  if (!order) {
    return (
      <div className="container py-8">
        <div className="mb-6">
          <Link href="/farmer/orders">
            <Button variant="ghost">← Back to Orders</Button>
          </Link>
        </div>
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-4">Order not found</h2>
        </div>
      </div>
    )
  }

  // Get farmer's products to filter the order items
  const farmerProducts = await getProducts(undefined, session.user.id)
  const farmerProductIds = farmerProducts.map((p: any) => p._id.toString())

  // Filter order products to only show this farmer's products
  const farmerOrderProducts = order.products.filter((product: any) => farmerProductIds.includes(product.productId))

  // Calculate total for just this farmer's products
  const farmerTotal = farmerOrderProducts.reduce(
    (sum: number, product: any) => sum + product.price * product.quantity,
    0,
  )

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Link href="/farmer/orders">
          <Button variant="ghost">← Back to Orders</Button>
        </Link>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>Order #{order._id.substring(0, 8)}</CardTitle>
                <p className="text-muted-foreground">Placed on {formatDate(order.createdAt)}</p>
              </div>
              <div className="flex items-center gap-4">
                <Badge className="capitalize">{order.status}</Badge>
                <UpdateOrderStatusButton orderId={order._id} currentStatus={order.status} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">Customer Information</h3>
                <p>
                  <span className="text-muted-foreground">Name:</span> {order.userName}
                </p>
                <p>
                  <span className="text-muted-foreground">Shipping Address:</span> {order.shippingAddress}
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium mb-2">Your Products in This Order</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4">Product</th>
                        <th className="text-left py-2 px-4">Price</th>
                        <th className="text-left py-2 px-4">Quantity</th>
                        <th className="text-right py-2 px-4">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {farmerOrderProducts.map((product: any) => (
                        <tr key={product.productId} className="border-b">
                          <td className="py-3 px-4">
                            <Link href={`/products/${product.productId}`} className="font-medium hover:underline">
                              {product.name}
                            </Link>
                          </td>
                          <td className="py-3 px-4">रू {product.price.toFixed(2)}</td>
                          <td className="py-3 px-4">{product.quantity}</td>
                          <td className="py-3 px-4 text-right">रू {(product.price * product.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                      <tr>
                        <td colSpan={3} className="py-3 px-4 text-right font-medium">
                          Subtotal:
                        </td>
                        <td className="py-3 px-4 text-right font-medium">रू {farmerTotal.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium mb-2">Payment Information</h3>
                <p>
                  <span className="text-muted-foreground">Payment Method:</span> {order.paymentMethod}
                </p>
                {order.paymentDetails && (
                  <>
                    <p>
                      <span className="text-muted-foreground">Payment ID:</span>{" "}
                      {order.paymentDetails.paymentId || "N/A"}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Payment Status:</span>{" "}
                      {order.paymentDetails.paymentStatus || "N/A"}
                    </p>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
