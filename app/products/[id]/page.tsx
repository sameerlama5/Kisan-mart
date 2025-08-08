import { getProductById } from "@/lib/actions/product-actions"
import { getProductReviews } from "@/lib/actions/review-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import AddToCartButton from "./add-to-cart-button"
import ProductReviews from "./product-reviews"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export default async function ProductPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const product = await getProductById(params.id)

  if (!product) {
    notFound()
  }

  const reviews = await getProductReviews(params.id)

  // Check if user can review (must be logged in as user and not already reviewed)
  let userCanReview = false
  if (session?.user?.role === "user") {
    const client = await clientPromise
    const db = client.db()

    const existingReview = await db.collection("reviews").findOne({
      productId: params.id,
      userId: session.user.id,
    })

    userCanReview = !existingReview
  }

  // Get farmer profile information
  const client = await clientPromise
  const db = client.db()

  const farmerProfile = await db.collection("users").findOne({
    _id: new ObjectId(product.farmerId),
  })

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Link href="/products">
          <Button variant="ghost">← Back to Products</Button>
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
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
            {product.averageRating && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`text-lg ${
                        star <= Math.round(product.averageRating!) ? "text-yellow-400" : "text-gray-300"
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  ({product.averageRating.toFixed(1)}) • {product.totalReviews} review
                  {product.totalReviews !== 1 ? "s" : ""}
                </span>
              </div>
            )}
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

      {/* Reviews Section */}
      <ProductReviews productId={product._id} reviews={reviews} userCanReview={userCanReview} />

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">About the Farmer</h2>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 rounded-full overflow-hidden bg-gray-200">
                <Image
                  src={farmerProfile?.profilePicture || "/placeholder.svg?height=64&width=64"}
                  alt={product.farmerName}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{product.farmerName}</h3>
                <p className="text-gray-300">
                  {farmerProfile?.farmName ? `${farmerProfile.farmName}` : "Local Farmer"}
                </p>
                {farmerProfile?.farmLocation && (
                  <p className="text-sm text-gray-300"> {farmerProfile.farmLocation}</p>
                )}
              </div>
            </div>

            {farmerProfile?.bio ? (
              <p className="mt-4">{farmerProfile.bio}</p>
            ) : (
              <p className="mt-4">
                This product is grown and harvested by {product.farmerName}, a local farmer committed to sustainable
                farming practices and providing high-quality produce.
              </p>
            )}

            {farmerProfile?.phone && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-300">
                  <span className="font-medium">Contact:</span> {farmerProfile.phone}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
