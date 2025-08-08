import { getProductById } from "@/lib/actions/product-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { optimizePrice, getSimilarProducts, getProductAnalytics } from "@/lib/algorithms/price-optimizer"
import Image from "next/image"
import { Progress } from "@/components/ui/progress"
import { ArrowUp, ArrowDown, Minus, AlertCircle, CheckCircle2 } from "lucide-react"
import PriceUpdateForm from "./price-update-form"

export default async function ProductPriceOptimizerPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login?callbackUrl=/farmer/tools/price-optimizer")
  }

  if (session.user.role !== "farmer") {
    redirect("/")
  }

  const product = await getProductById(params.id)

  if (!product) {
    return (
      <div className="container py-8">
        <div className="mb-6">
          <Link href="/farmer/tools/price-optimizer">
            <Button variant="ghost">← Back to Price Optimizer</Button>
          </Link>
        </div>
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-4">Product not found</h2>
        </div>
      </div>
    )
  }

  // Check if the product belongs to the current farmer
  if (product.farmerId !== session.user.id) {
    redirect("/farmer/tools/price-optimizer")
  }

  // Get similar products for comparison
  const similarProducts = await getSimilarProducts(product._id, product.category, product.farmerId)

  // Get product analytics
  const analytics = await getProductAnalytics(product._id)

  // Enhance product with analytics data
  const enhancedProduct = {
    ...product,
    views: analytics.views,
    sales: analytics.sales,
  }

  // Get price recommendation
  const recommendation = optimizePrice(enhancedProduct, similarProducts)

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Link href="/farmer/tools/price-optimizer">
          <Button variant="ghost">← Back to Price Optimizer</Button>
        </Link>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-square relative mb-4">
                <Image
                  alt={product.name}
                  className="object-cover rounded-md"
                  fill
                  src={product.images[0] || "/placeholder.svg?height=300&width=300"}
                />
              </div>
              <h2 className="text-xl font-bold">{product.name}</h2>
              <p className="text-muted-foreground mt-1">{product.description}</p>

              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Current Price:</span>
                  <span className="font-bold">Rs.{product.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Category:</span>
                  <span className="capitalize">{product.category}</span>
                </div>
                <div className="flex justify-between">
                  <span>Stock:</span>
                  <span>{product.stock} units</span>
                </div>
                <div className="flex justify-between">
                  <span>Views:</span>
                  <span>{analytics.views}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sales:</span>
                  <span>{analytics.sales} units</span>
                </div>
                <div className="flex justify-between">
                  <span>Conversion Rate:</span>
                  <span>
                    {analytics.views > 0 ? `${((analytics.sales / analytics.views) * 100).toFixed(1)}%` : "N/A"}
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <Link href={`/farmer/products/${product._id}/edit`}>
                  <Button variant="outline" className="w-full text-primary">
                    Edit Product
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Price Recommendation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                  <div className="text-sm text-muted-foreground">Current Price</div>
                  <div className="text-2xl font-bold">Rs.{product.price.toFixed(2)}</div>
                </div>

                <div className="flex items-center">
                  {Math.abs(recommendation.percentChange) < 2 ? (
                    <Minus className="h-6 w-6 text-muted-foreground mx-4" />
                  ) : recommendation.percentChange > 0 ? (
                    <ArrowUp className="h-6 w-6 text-green-500 mx-4" />
                  ) : (
                    <ArrowDown className="h-6 w-6 text-red-500 mx-4" />
                  )}
                </div>

                <div>
                  <div className="text-sm text-muted-foreground">Recommended Price</div>
                  <div className="text-2xl font-bold">Rs.{recommendation.recommendedPrice.toFixed(2)}</div>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Confidence Score</span>
                  <span className="text-sm font-medium">{recommendation.confidenceScore}%</span>
                </div>
                <Progress value={recommendation.confidenceScore} className="h-2" />
              </div>

              <div className="mb-6">
                <h3 className="font-medium mb-2">Recommended Price Range</h3>
                <div className="flex justify-between items-center bg-muted p-3 rounded-md">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Minimum</div>
                    <div className="font-medium text-primary">Rs.{recommendation.minPrice.toFixed(2)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Recommended</div>
                    <div className="font-bold text-primary">Rs.{recommendation.recommendedPrice.toFixed(2)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Maximum</div>
                    <div className="font-medium text-primary">Rs.{recommendation.maxPrice.toFixed(2)}</div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-medium mb-2">Analysis</h3>
                <div className="space-y-2">
                  {recommendation.reasoning.map((reason, index) => (
                    <div key={index} className="flex items-start gap-2">
                      {reason.includes("Consider increasing") ? (
                        <ArrowUp className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : reason.includes("Consider decreasing") ? (
                        <ArrowDown className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                      ) : reason.includes("optimal") ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                      )}
                      <p className="text-sm">{reason}</p>
                    </div>
                  ))}
                </div>
              </div>

              <PriceUpdateForm
                productId={product._id}
                currentPrice={product.price}
                recommendedPrice={recommendation.recommendedPrice}
                minPrice={recommendation.minPrice}
                maxPrice={recommendation.maxPrice}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How This Works</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Our price optimization algorithm analyzes several factors to recommend the optimal price for your
                product:
              </p>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Market Analysis</h3>
                  <p className="text-sm text-muted-foreground">
                    We analyze current market prices for similar products in your category to ensure your pricing is
                    competitive.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium">Demand Assessment</h3>
                  <p className="text-sm text-muted-foreground">
                    We evaluate the demand for your product based on views, sales, and conversion rates to determine
                    price elasticity.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium">Seasonal Factors</h3>
                  <p className="text-sm text-muted-foreground">
                    We consider seasonal trends that affect pricing in your product category.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium">Stock Levels</h3>
                  <p className="text-sm text-muted-foreground">
                    Your current inventory levels are factored in to help balance between quick sales and maximizing
                    profit.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
