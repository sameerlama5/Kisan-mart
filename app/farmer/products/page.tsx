import { getProducts } from "@/lib/actions/product-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { Pencil, Package, Plus } from "lucide-react"
import DeleteProductButton from "./delete-product-button"
import Image from "next/image"

export default async function FarmerProductsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login?callbackUrl=/farmer/products")
  }

  if (session.user.role !== "farmer") {
    redirect("/")
  }

  const products = await getProducts(undefined, session.user.id)

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Package className="h-8 w-8" />
            Your Products
          </h1>
          <p className="text-muted-foreground mt-1">Manage your product listings and inventory</p>
        </div>
        <Link href="/farmer/products/new">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add New Product
          </Button>
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-4">You haven&apos;t added any products yet</h2>
          <p className="text-muted-foreground mb-6">Add your first product to start selling</p>
          <Link href="/farmer/products/new">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Your First Product
            </Button>
          </Link>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Products ({products.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Product</th>
                    <th className="text-left py-3 px-4">Price</th>
                    <th className="text-left py-3 px-4">Stock</th>
                    <th className="text-left py-3 px-4">Category</th>
                    <th className="text-left py-3 px-4">Date Added</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product: any) => (
                    <tr key={product._id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-md overflow-hidden bg-muted">
                            <Image
                              src={product.images?.[0] || "/placeholder.svg?height=48&width=48"}
                              alt={product.name || "Product"}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          </div>
                          <div>
                            <Link href={`/farmer/products/${product._id}`} className="font-medium hover:underline">
                              {product.name || "Unnamed Product"}
                            </Link>
                            <p className="text-sm text-gray-300 truncate max-w-[200px]">
                              {product.description || "No description"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium">
                          Rs.{" "}
                          {typeof product.price === "number" && !isNaN(product.price)
                            ? product.price.toFixed(2)
                            : "0.00"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            typeof product.stock === "number" && !isNaN(product.stock) && product.stock > 0
                              ? "default"
                              : "destructive"
                          }
                        >
                          {typeof product.stock === "number" && !isNaN(product.stock) ? product.stock : 0} units
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <span className="capitalize">{product.category || "uncategorized"}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm">{product.createdAt ? formatDate(product.createdAt) : "Unknown"}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Link href={`/farmer/products/${product._id}/edit`}>
                            <Button variant="outline" size="icon" title="Edit Product">
                              <Pencil className="h-4 w-4 text-primary" />
                            </Button>
                          </Link>
                          <DeleteProductButton id={product._id} name={product.name || "Unnamed Product"} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
