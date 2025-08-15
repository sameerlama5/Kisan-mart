"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import {  createMarketData } from "@/lib/actions/market-data-actions"

export default function NewMarketDataPage() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const [formData, setFormData] = useState({
    category: "",
    avgPrice: 0,
    minPrice: 0,
    maxPrice: 0,
    demandScore: 5,
    seasonalityFactor: 1.0,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await createMarketData(formData)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: result.success,
        })
        router.push("/admin/market-data")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create market data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/admin/market-data">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Market Data
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Add New Market Data</h1>
        <p className="text-gray-600 mt-2">Create market data for a new product category</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Market Data Details</CardTitle>
          <CardDescription>Enter the market data information for the new category</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="category">Category Name</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value.toLowerCase() })}
                placeholder="e.g., vegetables, fruits, dairy"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="avgPrice">Average Price (Rs.)</Label>
                <Input
                  id="avgPrice"
                  type="number"
                  value={formData.avgPrice}
                  onChange={(e) => setFormData({ ...formData, avgPrice: Number(e.target.value) })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="demandScore">Demand Score (1-10)</Label>
                <Input
                  id="demandScore"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.demandScore}
                  onChange={(e) => setFormData({ ...formData, demandScore: Number(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minPrice">Minimum Price (Rs.)</Label>
                <Input
                  id="minPrice"
                  type="number"
                  value={formData.minPrice}
                  onChange={(e) => setFormData({ ...formData, minPrice: Number(e.target.value) })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="maxPrice">Maximum Price (Rs.)</Label>
                <Input
                  id="maxPrice"
                  type="number"
                  value={formData.maxPrice}
                  onChange={(e) => setFormData({ ...formData, maxPrice: Number(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="seasonalityFactor">Seasonality Factor (0.8-1.2)</Label>
              <Input
                id="seasonalityFactor"
                type="number"
                step="0.1"
                min="0.8"
                max="1.2"
                value={formData.seasonalityFactor}
                onChange={(e) => setFormData({ ...formData, seasonalityFactor: Number(e.target.value) })}
                required
              />
              <p className="text-xs text-gray-600 mt-1">
                1.0 = neutral seasonality, &gt;1.0 = in season (higher prices), &lt;1.0 = out of season (lower prices)
              </p>
            </div>

            <div className="flex gap-4">
              <Link href="/admin/market-data">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Market Data"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
