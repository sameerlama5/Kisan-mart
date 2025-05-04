import { getProductById } from "@/lib/actions/product-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import AddToCartButton from "./add-to-cart-button"

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProductById(params.id)

  if (!product) {
    notFound()
  }

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Link href="/products">
          <Button variant="ghost">← Back to Products</Button>
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="relative aspect-square">
          <Image
            src={product.images[0] || "/placeholder.svg?height=600&width=600"}
            alt={product.name}
            fill
            className="object-cover rounded-lg"
          />
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="text-muted-foreground">By {product.farmerName}</p>
          </div>

          <div className="text-2xl font-bold">Rs.{product.price.toFixed(2)}</div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <p>{product.description}</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Details</h2>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Category: {product.category}</li>
              <li>Stock: {product.stock} available</li>
            </ul>
          </div>

          <div className="mt-4">
            <AddToCartButton productId={product._id} />
          </div>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">About the Farmer</h2>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 rounded-full overflow-hidden">
                <Image
                  src="/placeholder.svg?height=64&width=64"
                  alt={product.farmerName}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{product.farmerName}</h3>
                <p className="text-muted-foreground">Local Farmer</p>
              </div>
            </div>
            <p className="mt-4">
              This product is grown and harvested by {product.farmerName}, a local farmer committed to sustainable
              farming practices and providing high-quality produce.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
