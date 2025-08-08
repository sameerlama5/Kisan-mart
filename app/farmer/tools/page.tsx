import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { Calculator, TrendingUp, BarChart } from "lucide-react"

export default async function FarmerToolsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login?callbackUrl=/farmer/tools")
  }

  if (session.user.role !== "farmer") {
    redirect("/")
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Farmer Tools</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 mb-3">
              <Calculator className="h-5 w-5 text-primary-foreground" />
              Price Optimizer
            </CardTitle>
            <CardDescription className="text-white">Get smart pricing recommendations for your products based on market data</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-white">
              Our algorithm analyzes market trends, demand, and competition to suggest optimal pricing for your
              products.
            </p>
            <Link href="/farmer/tools/price-optimizer">
              <Button className="w-full">Use Price Optimizer</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-5 w-5 text-primary-foreground" />
              Market Trends
            </CardTitle>
            <CardDescription className="text-white">Stay updated with the latest market trends and price fluctuations</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-white">
              Track price changes and demand patterns for different product categories over time.
            </p>
            <Button className="w-full text-primary" variant="outline">
              Coming Soon
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 mb-3">
              <BarChart className="h-5 w-5 text-primary-foreground" />
              Sales Analytics
            </CardTitle>
            <CardDescription className="text-white">Detailed analytics to help you understand your sales performance</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-white">
              Get insights into your best-selling products, customer preferences, and sales patterns.
            </p>
            <Button className="w-full text-primary" variant="outline">
              Coming Soon
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
