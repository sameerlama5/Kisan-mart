"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Star, Flag, Trash2, ShieldCheck } from "lucide-react"
import { addReview, flagReview, deleteReview } from "@/lib/actions/review-actions"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Review {
  _id: string
  userId: string
  userName: string
  rating: number
  comment: string
  isVerifiedPurchase: boolean
  createdAt: string
}

interface ProductReviewsProps {
  productId: string
  reviews: Review[]
  userCanReview: boolean
}

export default function ProductReviews({ productId, reviews, userCanReview }: ProductReviewsProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session) {
      router.push(`/login?callbackUrl=/products/${productId}`)
      return
    }

    if (rating === 0) {
      alert("Please select a rating")
      return
    }

    setIsSubmitting(true)

    const formData = new FormData()
    formData.append("productId", productId)
    formData.append("rating", rating.toString())
    formData.append("comment", comment)

    try {
      const result = await addReview(formData)

      if (result.error) {
        alert(result.error)
      } else {
        alert("Review added successfully!")
        setRating(0)
        setComment("")
        setShowReviewForm(false)
        router.refresh()
      }
    } catch (error) {
      alert("Failed to add review")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFlagReview = async (reviewId: string) => {
    const reason = prompt("Please provide a reason for flagging this review:")
    if (!reason) return

    try {
      const result = await flagReview(reviewId, reason)
      if (result.error) {
        alert(result.error)
      } else {
        alert("Review flagged for moderation")
        router.refresh()
      }
    } catch (error) {
      alert("Failed to flag review")
    }
  }

  const handleDeleteReview = async (reviewId: string) => {
    try {
      const result = await deleteReview(reviewId)
      if (result.error) {
        alert(result.error)
      } else {
        alert("Review deleted successfully")
        router.refresh()
      }
    } catch (error) {
      alert("Failed to delete review")
    }
  }

  const renderStars = (rating: number, interactive = false, onStarClick?: (star: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            } ${interactive ? "cursor-pointer hover:text-yellow-400" : ""}`}
            onClick={() => interactive && onStarClick?.(star)}
          />
        ))}
      </div>
    )
  }

  const averageRating =
    reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Customer Reviews</span>
            <div className="flex items-center gap-2">
              {averageRating > 0 && (
                <>
                  {renderStars(Math.round(averageRating))}
                  <span className="text-sm text-gray-400">
                    ({averageRating.toFixed(1)}) • {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                  </span>
                </>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add Review Form */}
          {userCanReview && session?.user?.role === "user" && (
            <div className="border-b pb-6">
              {!showReviewForm ? (
                <Button onClick={() => setShowReviewForm(true)}>Write a Review</Button>
              ) : (
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                    <Label>Rating</Label>
                    {renderStars(rating, true, setRating)}
                  </div>
                  <div>
                    <Label htmlFor="comment">Your Review</Label>
                    <Textarea
                      id="comment"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share your experience with this product..."
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Submitting..." : "Submit Review"}
                    </Button>
                    <Button type="button" variant="outline" className="text-primary" onClick={() => setShowReviewForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Reviews List */}
          {reviews.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No reviews yet. Be the first to review this product!
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review._id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{review.userName}</span>
                      {review.isVerifiedPurchase && (
                        <Badge variant="secondary" className="text-xs">
                          <ShieldCheck className="h-3 w-3 mr-1" />
                          Verified Purchase
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-300">{formatDate(review.createdAt)}</span>
                      {session?.user && (
                        <div className="flex gap-1">
                          {session.user.id !== review.userId && (
                            <Button variant="ghost" size="sm" onClick={() => handleFlagReview(review._id)}>
                              <Flag className="h-4 w-4" />
                            </Button>
                          )}
                          {(session.user.id === review.userId || session.user.role === "admin") && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Review</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this review? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteReview(review._id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mb-2">{renderStars(review.rating)}</div>
                  <p className="text-sm">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
