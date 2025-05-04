import { getAllOrders } from "@/lib/actions/order-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import Link from "next/link"
import UpdateOrderStatusButton from "./update-order-status-button"

export default async function AdminOrdersPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login?callbackUrl=/admin/orders")
  }

  if (session.user.role !== "admin") {
    redirect("/")
  }

  const orders = await getAllOrders()

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">All Orders</h1>

      <Card>
        <CardHeader>
          <CardTitle>Orders ({orders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Order ID</th>
                  <th className="text-left py-3 px-4">Customer</th>
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-left py-3 px-4">Total</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-4 text-center text-muted-foreground">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  orders.map((order: any) => (
                    <tr key={order._id} className="border-b">
                      <td className="py-3 px-4">
                        <Link href={`/admin/orders/${order._id}`} className="font-medium hover:underline">
                          #{order._id.substring(0, 8)}
                        </Link>
                      </td>
                      <td className="py-3 px-4">{order.userName}</td>
                      <td className="py-3 px-4">{formatDate(order.createdAt)}</td>
                      <td className="py-3 px-4">${order.totalAmount.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <Badge className="capitalize">{order.status}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <UpdateOrderStatusButton orderId={order._id} currentStatus={order.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
