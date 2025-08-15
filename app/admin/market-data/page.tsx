import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, TrendingUp, TrendingDown, Minus } from "lucide-react"
import Link from "next/link"
import { MarketDataActions } from "./market-data-actions"
import { InitializeDataButton } from "./initialize-data-button"
import { getAllMarketData } from "@/lib/actions/market-data-actions"

export default async function AdminMarketDataPage() {
  const marketData = await getAllMarketData()

  const getSeasonalityIcon = (factor: number) => {
    if (factor > 1.05) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (factor < 0.95) return <TrendingDown className="h-4 w-4 text-red-600" />
    return <Minus className="h-4 w-4 text-gray-600" />
  }

  const getSeasonalityText = (factor: number) => {
    if (factor > 1.05) return "In Season"
    if (factor < 0.95) return "Out of Season"
    return "Neutral"
  }

  const getDemandColor = (score: number) => {
    if (score >= 8) return "bg-green-100 text-green-800"
    if (score >= 6) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Market Data Management</h1>
          <p className="text-gray-600 mt-2">Manage market data for price optimization algorithm</p>
        </div>
        <div className="flex gap-2">
          <InitializeDataButton />
          <Link href="/admin/market-data/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </Link>
        </div>
      </div>

      {marketData.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">No Market Data Found</h3>
            <p className="text-gray-600 mb-4">
              Initialize default market data or create new categories to get started.
            </p>
            <InitializeDataButton />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {marketData.map((data: any) => (
            <Card key={data._id} className="relative">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="capitalize">{data.category}</CardTitle>
                    <CardDescription className="text-gray-300">Updated by {data.lastUpdatedByName}</CardDescription>
                  </div>
                  <MarketDataActions marketData={data} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-300">Average Price</p>
                    <p className="text-lg font-semibold">Rs. {data.avgPrice}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-300">Price Range</p>
                    <p className="text-sm">
                      Rs. {data.minPrice} - Rs. {data.maxPrice}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-300">Demand Score</p>
                    <Badge className={getDemandColor(data.demandScore)}>{data.demandScore}/10</Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-300">Seasonality</p>
                    <div className="flex items-center gap-1">
                      {getSeasonalityIcon(data.seasonalityFactor)}
                      <span className="text-sm">{getSeasonalityText(data.seasonalityFactor)}</span>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-gray-300 pt-2 border-t">
                  Last updated: {new Date(data.updatedAt).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
