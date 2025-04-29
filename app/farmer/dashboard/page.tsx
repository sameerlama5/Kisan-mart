import { getProducts } from "@/lib/actions/product-actions"
import { getFarmerOrders } from "@/lib/actions/order-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { Package, ShoppingCart, TrendingUp } from "lucide-react"

export default async function FarmerDashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login?callbackUrl=/farmer/dashboard")
  }

  if (session.user.role !== "farmer") {
    redirect("/")
  }

  const products = await getProducts(undefined, session.user.id)
  const orders = await getFarmerOrders()

  const totalProducts = products.length
  const totalOrders = orders.length
  const totalSales = orders.reduce((total: number, order: any) => {
    return (
      total +
      order.products.reduce((orderTotal: number, product: any) => {
        return orderTotal + product.price * product.quantity
      }, 0)
    )
  }, 0)

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold">Farmer Dashboard</h1>
        <Link href="/farmer/products/new">
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90">Add New Product</Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card className="border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">Products in your inventory</p>
          </CardContent>
        </Card>
        <Card className="border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">Orders received for your products</p>
          </CardContent>
        </Card>
        <Card className="border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSales.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Revenue from all orders</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Recent Products</CardTitle>
            <CardDescription>Your recently added products</CardDescription>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground">No products yet</p>
                <Link href="/farmer/products/new" className="mt-2 inline-block">
                  <Button variant="outline" size="sm">
                    Add Your First Product
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {products.slice(0, 5).map((product: any) => (
                  <div key={product._id} className="flex items-center justify-between">
                    <div>
                      <Link href={`/farmer/products/${product._id}`} className="font-medium hover:underline">
                        {product.name}
                      </Link>
                      <div className="text-sm text-muted-foreground">
                        ${product.price.toFixed(2)} • {product.stock} in stock
                      </div>
                    </div>
                    <Badge className={product.stock > 0 ? "bg-green-500" : "bg-red-500"}>
                      {product.stock > 0 ? "In Stock" : "Out of Stock"}
                    </Badge>
                  </div>
                ))}
                {products.length > 5 && (
                  <div className="text-center mt-4">
                    <Link href="/farmer/products">
                      <Button variant="outline" size="sm">
                        View All Products
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Recent orders for your products</CardDescription>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground">No orders yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.slice(0, 5).map((order: any) => (
                  <div key={order._id} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Order #{order._id.substring(0, 8)}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(order.createdAt)} • {order.products.length} products
                      </div>
                    </div>
                    <Badge className="capitalize">{order.status}</Badge>
                  </div>
                ))}
                {orders.length > 5 && (
                  <div className="text-center mt-4">
                    <Link href="/farmer/orders">
                      <Button variant="outline" size="sm">
                        View All Orders
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
