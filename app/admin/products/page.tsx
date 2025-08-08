import { getProducts } from "@/lib/actions/product-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"

export default async function AdminProductsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login?callbackUrl=/admin/products")
  }

  if (session.user.role !== "admin") {
    redirect("/")
  }

  const products = await getProducts()

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">All Products</h1>

      <Card>
        <CardHeader>
          <CardTitle>Products ({products.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Image</th>
                  <th className="text-left py-3 px-4">Product</th>
                  <th className="text-left py-3 px-4">Price</th>
                  <th className="text-left py-3 px-4">Stock</th>
                  <th className="text-left py-3 px-4">Category</th>
                  <th className="text-left py-3 px-4">Farmer</th>
                  <th className="text-left py-3 px-4">Date Added</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-4 text-center text-muted-foreground">
                      No products found
                    </td>
                  </tr>
                ) : (
                  products.map((product: any) => (
                    <tr key={product._id} className="border-b">
                      <td className="py-3 px-4">
                        <div className="relative h-10 w-10 rounded overflow-hidden">
                          <Image
                            src={product.images[0] || "/placeholder.svg?height=40&width=40"}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium">{product.name}</td>
                      <td className="py-3 px-4">Rs.{product.price.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <Badge className={product.stock > 0 ? "bg-green-500" : "bg-red-500"}>{product.stock}</Badge>
                      </td>
                      <td className="py-3 px-4 capitalize">{product.category}</td>
                      <td className="py-3 px-4">{product.farmerName}</td>
                      <td className="py-3 px-4">{formatDate(product.createdAt)}</td>
                      <td className="py-3 px-4">
                        <Link href={`/products/${product._id}`}>
                          <Button className="text-primary" variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" /> View
                          </Button>
                        </Link>
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
