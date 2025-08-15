import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { optimizePrice } from "@/lib/algorithms/price-optimizer";
import { PriceUpdateForm } from "./price-update-form";

export default async function PriceOptimizerDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== "farmer") {
    redirect("/login");
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    const product = await db.collection("products").findOne({
      _id: new ObjectId(params.id),
      farmerId: session.user.id,
    });

    if (!product) {
      redirect("/farmer/tools/price-optimizer");
    }

    const similarProducts = await db
      .collection("products")
      .find({
        category: product.category,
        farmerId: { $ne: session.user.id },
      })
      .limit(10)
      .toArray();

    const recommendation = await optimizePrice(
      {
        _id: product._id.toString(),
        name: product.name,
        price: product.price,
        category: product.category,
        stock: product.stock,
        sales: Math.floor(Math.random() * 20),
        views: Math.floor(Math.random() * 100),
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      },
      similarProducts.map((p) => ({
        _id: p._id.toString(),
        name: p.name,
        price: p.price,
        category: p.category,
        stock: p.stock,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      }))
    );

    const getPriceChangeIcon = (change: number) => {
      if (change > 0) return <TrendingUp className="h-5 w-5 text-green-600" />;
      if (change < 0) return <TrendingDown className="h-5 w-5 text-red-600" />;
      return <CheckCircle className="h-5 w-5 text-blue-600" />;
    };

    const getPriceChangeColor = (change: number) => {
      if (change > 0) return "text-green-600";
      if (change < 0) return "text-red-600";
      return "text-blue-600";
    };

    const getConfidenceColor = (score: number) => {
      if (score >= 80) return "bg-green-100 text-green-800";
      if (score >= 60) return "bg-yellow-100 text-yellow-800";
      return "bg-red-100 text-red-800";
    };

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/farmer/tools/price-optimizer">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Price Optimizer
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Price Optimization</h1>
          <p className="text-gray-600 mt-2">
            AI-powered pricing recommendations for your product
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Product Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>{product.name}</CardTitle>
                <CardDescription className="text-white">Category: {product.category}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-white">Current Price</p>
                  <p className="text-2xl font-bold">Rs. {product.price}</p>
                </div>
                <div>
                  <p className="text-sm text-white">Stock</p>
                  <p className="text-lg">{product.stock} units</p>
                </div>
                <div>
                  <p className="text-sm text-white">Listed</p>
                  <p className="text-sm">
                    {new Date(product.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recommendation */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {getPriceChangeIcon(recommendation.priceChange)}
                      Price Recommendation
                    </CardTitle>
                    <CardDescription className="text-white">
                      Based on market data, demand, and competition analysis
                    </CardDescription>
                  </div>
                  <Badge
                    className={getConfidenceColor(
                      recommendation.confidenceScore
                    )}
                  >
                    {recommendation.confidenceScore}% Confidence
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Price Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-300">Current</p>
                    <p className="text-lg font-semibold">
                      Rs. {recommendation.currentPrice}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-300">Recommended</p>
                    <p className="text-lg font-semibold text-blue-600">
                      Rs. {recommendation.recommendedPrice}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-300">Change</p>
                    <p
                      className={`text-lg font-semibold ${getPriceChangeColor(
                        recommendation.priceChange
                      )}`}
                    >
                      {recommendation.priceChange > 0 ? "+" : ""}Rs.{" "}
                      {recommendation.priceChange.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-300">Percentage</p>
                    <p
                      className={`text-lg font-semibold ${getPriceChangeColor(
                        recommendation.priceChange
                      )}`}
                    >
                      {recommendation.percentChange > 0 ? "+" : ""}
                      {recommendation.percentChange.toFixed(1)}%
                    </p>
                  </div>
                </div>

                {/* Price Range */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 text-primary">
                    Recommended Price Range
                  </h4>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-primary">
                      Min: Rs. {recommendation.minPrice}
                    </span>
                    <span className="text-sm text-primary">
                      Max: Rs. {recommendation.maxPrice}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-accent h-2 rounded-full"
                      style={{
                        width: `${
                          ((recommendation.recommendedPrice -
                            recommendation.minPrice) /
                            (recommendation.maxPrice -
                              recommendation.minPrice)) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Reasoning */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Analysis & Reasoning
                  </h4>
                  <div className="space-y-2">
                    {recommendation.reasoning.map((reason, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-2 text-sm"
                      >
                        <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-gray-300">{reason}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Update Price Form */}
                <div className="border-t pt-6">
                  <PriceUpdateForm
                    productId={product._id.toString()}
                    currentPrice={product.price}
                    recommendedPrice={recommendation.recommendedPrice}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Market Comparison */}
        {similarProducts.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Market Comparison</CardTitle>
              <CardDescription>
                Similar products in the {product.category} category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Product</th>
                      <th className="text-left py-2">Price</th>
                      <th className="text-left py-2">Stock</th>
                      <th className="text-left py-2">Farmer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {similarProducts.slice(0, 5).map((similarProduct: any) => (
                      <tr
                        key={similarProduct._id.toString()}
                        className="border-b"
                      >
                        <td className="py-2">{similarProduct.name}</td>
                        <td className="py-2">Rs. {similarProduct.price}</td>
                        <td className="py-2">{similarProduct.stock} units</td>
                        <td className="py-2">{similarProduct.farmerName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  } catch (error) {
    console.error("Price optimizer detail error:", error);
    redirect("/farmer/tools/price-optimizer");
  }
}
