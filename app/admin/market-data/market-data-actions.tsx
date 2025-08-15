"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { deleteMarketData, updateMarketData } from "@/lib/actions/market-data-actions"

interface MarketDataActionsProps {
  marketData: any
}

export function MarketDataActions({ marketData }: MarketDataActionsProps) {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    avgPrice: marketData.avgPrice,
    minPrice: marketData.minPrice,
    maxPrice: marketData.maxPrice,
    demandScore: marketData.demandScore,
    seasonalityFactor: marketData.seasonalityFactor,
  })

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await updateMarketData(marketData._id, formData)

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
        setIsEditOpen(false)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update market data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    setIsLoading(true)

    try {
      const result = await deleteMarketData(marketData._id)

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
        setIsDeleteOpen(false)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete market data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsDeleteOpen(true)} className="text-red-600">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Market Data - {marketData.category}</DialogTitle>
            <DialogDescription>Update the market data for this category.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit}>
            <div className="grid gap-4 py-4">
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
                  <Label htmlFor="minPrice">Min Price (Rs.)</Label>
                  <Input
                    id="minPrice"
                    type="number"
                    value={formData.minPrice}
                    onChange={(e) => setFormData({ ...formData, minPrice: Number(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="maxPrice">Max Price (Rs.)</Label>
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
                  1.0 = neutral, &gt;1.0 = in season, &lt;1.0 = out of season
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Market Data</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the market data for "{marketData.category}"? This action cannot be undone
              and will affect price optimization for this category.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
              {isLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
