import { getProducts } from "@/lib/actions/product-actions"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { ArrowRight } from "lucide-react"
import Image from "next/image"

export default async function PriceOptimizerPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login?callbackUrl=/farmer/tools/price-optimizer")
  }

  if (session.user.role !== "farmer") {
    redirect("/")
  }

  const products = await getProducts(undefined, session.user.id)

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Link href="/farmer/tools">
          <Button variant="ghost">← Back to Tools</Button>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Price Optimizer</h1>
        <p className="text-muted-foreground">
          Get smart pricing recommendations for your products based on market data, demand, and competition.
        </p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-4">You haven&apos;t added any products yet</h2>
          <p className="text-muted-foreground mb-6">Add products to get pricing recommendations</p>
          <Link href="/farmer/products/new">
            <Button>Add Your First Product</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product: any) => (
            <Card key={product._id} className="overflow-hidden">
              <div className="aspect-square relative">
                <Image
                  alt={product.name}
                  className="object-cover"
                  fill
                  src={product.images[0] || "/placeholder.svg?height=200&width=200"}
                />
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold truncate">{product.name}</h3>
                <p className="text-sm text-muted-foreground truncate">{product.description}</p>
                <div className="flex items-center justify-between mt-2">
                  <p className="font-medium">Rs. {product.price.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">Stock: {product.stock}</p>
                </div>
                <div className="mt-4">
                  <Link href={`/farmer/tools/price-optimizer/${product._id}`}>
                    <Button className="w-full text-primary" variant="outline">
                      Optimize Price <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
