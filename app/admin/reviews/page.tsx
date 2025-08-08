import { getAllReviews, getFlaggedReviews } from "@/lib/actions/review-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, ShieldCheck } from "lucide-react"
import ReviewModerationActions from "./review-moderation-actions"

export default async function AdminReviewsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login?callbackUrl=/admin/reviews")
  }

  if (session.user.role !== "admin") {
    redirect("/")
  }

  const allReviews = await getAllReviews()
  const flaggedReviews = await getFlaggedReviews()

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Review Management</h1>

      <Tabs defaultValue="flagged" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="flagged">Flagged Reviews ({flaggedReviews.length})</TabsTrigger>
          <TabsTrigger value="all">All Reviews ({allReviews.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="flagged" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reviews Requiring Moderation</CardTitle>
            </CardHeader>
            <CardContent>
              {flaggedReviews.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No reviews requiring moderation</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {flaggedReviews.map((review: any) => (
                    <div key={review._id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{review.userName}</span>
                            {review.isVerifiedPurchase && (
                              <Badge variant="secondary" className="text-xs">
                                <ShieldCheck className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                            <Badge variant={review.status === "flagged" ? "destructive" : "secondary"}>
                              {review.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">Product: {review.productName}</p>
                          <p className="text-sm text-muted-foreground">{formatDate(review.createdAt)}</p>
                        </div>
                        <div className="text-right">{renderStars(review.rating)}</div>
                      </div>

                      <p className="mb-3">{review.comment}</p>

                      {review.moderationReason && (
                        <div className="bg-red-50 border border-red-200 rounded p-2 mb-3">
                          <p className="text-sm text-red-800">
                            <strong>Flag Reason:</strong> {review.moderationReason}
                          </p>
                        </div>
                      )}

                      <ReviewModerationActions
                        reviewId={review._id}
                        productId={review.productId}
                        currentStatus={review.status}
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allReviews.map((review: any) => (
                  <div key={review._id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{review.userName}</span>
                          {review.isVerifiedPurchase && (
                            <Badge variant="secondary" className="text-xs">
                              <ShieldCheck className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                          <Badge
                            variant={
                              review.status === "approved"
                                ? "default"
                                : review.status === "rejected"
                                  ? "destructive"
                                  : review.status === "flagged"
                                    ? "destructive"
                                    : "secondary"
                            }
                          >
                            {review.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Product: {review.productName}</p>
                        <p className="text-sm text-muted-foreground">{formatDate(review.createdAt)}</p>
                      </div>
                      <div className="text-right">{renderStars(review.rating)}</div>
                    </div>

                    <p className="mb-3">{review.comment}</p>

                    {review.moderationReason && (
                      <div className="bg-gray-50 border rounded p-2 mb-3">
                        <p className="text-sm text-gray-700">
                          <strong>Moderation Note:</strong> {review.moderationReason}
                        </p>
                      </div>
                    )}

                    <ReviewModerationActions
                      reviewId={review._id}
                      productId={review.productId}
                      currentStatus={review.status}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
