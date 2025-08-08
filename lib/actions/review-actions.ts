"use server"

import { revalidatePath } from "next/cache"
import clientPromise from "../mongodb"
import type { Review } from "../db-models"
import { ObjectId } from "mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth"

export async function addReview(formData: FormData) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user || session.user.role !== "user") {
    return { error: "Only customers can add reviews" }
  }

  const productId = formData.get("productId") as string
  const rating = Number.parseInt(formData.get("rating") as string)
  const comment = formData.get("comment") as string

  if (!productId || !rating || !comment) {
    return { error: "Missing required fields" }
  }

  if (rating < 1 || rating > 5) {
    return { error: "Rating must be between 1 and 5" }
  }

  try {
    const client = await clientPromise
    const db = client.db()

    // Check if product exists
    const product = await db.collection("products").findOne({ _id: new ObjectId(productId) })
    if (!product) {
      return { error: "Product not found" }
    }

    // Check if user already reviewed this product
    const existingReview = await db.collection("reviews").findOne({
      productId,
      userId: session.user.id,
    })

    if (existingReview) {
      return { error: "You have already reviewed this product" }
    }

    // Check if user has purchased this product
    const hasPurchased = await db.collection("orders").findOne({
      userId: session.user.id,
      "products.productId": productId,
      status: { $in: ["delivered", "processing", "shipped"] },
    })

    const newReview: Review = {
      productId,
      productName: product.name,
      userId: session.user.id,
      userName: session.user.name,
      rating,
      comment: comment.trim(),
      status: "approved", // Auto-approve for now, can be changed to "pending" for moderation
      isVerifiedPurchase: !!hasPurchased,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("reviews").insertOne(newReview)

    // Update product rating
    await updateProductRating(productId)

    revalidatePath(`/products/${productId}`)
    return { success: "Review added successfully", reviewId: result.insertedId.toString() }
  } catch (error) {
    console.error("Add review error:", error)
    return { error: "Failed to add review" }
  }
}

export async function getProductReviews(productId: string) {
  try {
    const client = await clientPromise
    const db = client.db()

    const reviews = await db
      .collection("reviews")
      .find({
        productId,
        status: { $in: ["approved"] },
      })
      .sort({ createdAt: -1 })
      .toArray()

    return JSON.parse(JSON.stringify(reviews))
  } catch (error) {
    console.error("Get product reviews error:", error)
    return []
  }
}

export async function getAllReviews() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user || session.user.role !== "admin") {
    return []
  }

  try {
    const client = await clientPromise
    const db = client.db()

    const reviews = await db.collection("reviews").find({}).sort({ createdAt: -1 }).toArray()

    return JSON.parse(JSON.stringify(reviews))
  } catch (error) {
    console.error("Get all reviews error:", error)
    return []
  }
}

export async function getFlaggedReviews() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user || session.user.role !== "admin") {
    return []
  }

  try {
    const client = await clientPromise
    const db = client.db()

    const reviews = await db
      .collection("reviews")
      .find({ status: { $in: ["flagged", "pending"] } })
      .sort({ createdAt: -1 })
      .toArray()

    return JSON.parse(JSON.stringify(reviews))
  } catch (error) {
    console.error("Get flagged reviews error:", error)
    return []
  }
}

export async function moderateReview(reviewId: string, action: "approve" | "reject" | "flag", reason?: string) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user || session.user.role !== "admin") {
    return { error: "Unauthorized" }
  }

  try {
    const client = await clientPromise
    const db = client.db()

    const review = await db.collection("reviews").findOne({ _id: new ObjectId(reviewId) })
    if (!review) {
      return { error: "Review not found" }
    }

    const updateData: any = {
      status: action === "approve" ? "approved" : action === "reject" ? "rejected" : "flagged",
      moderatedBy: session.user.id,
      moderatedAt: new Date(),
      updatedAt: new Date(),
    }

    if (reason) {
      updateData.moderationReason = reason
    }

    await db.collection("reviews").updateOne({ _id: new ObjectId(reviewId) }, { $set: updateData })

    // Update product rating after moderation
    await updateProductRating(review.productId)

    revalidatePath("/admin/reviews")
    revalidatePath(`/products/${review.productId}`)

    return { success: `Review ${action}ed successfully` }
  } catch (error) {
    console.error("Moderate review error:", error)
    return { error: "Failed to moderate review" }
  }
}

export async function flagReview(reviewId: string, reason: string) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return { error: "Unauthorized" }
  }

  try {
    const client = await clientPromise
    const db = client.db()

    await db.collection("reviews").updateOne(
      { _id: new ObjectId(reviewId) },
      {
        $set: {
          status: "flagged",
          moderationReason: reason,
          updatedAt: new Date(),
        },
      },
    )

    revalidatePath("/admin/reviews")
    return { success: "Review flagged for moderation" }
  } catch (error) {
    console.error("Flag review error:", error)
    return { error: "Failed to flag review" }
  }
}

async function updateProductRating(productId: string) {
  try {
    const client = await clientPromise
    const db = client.db()

    // Calculate average rating from approved reviews
    const reviews = await db.collection("reviews").find({ productId, status: "approved" }).toArray()

    if (reviews.length === 0) {
      await db.collection("products").updateOne(
        { _id: new ObjectId(productId) },
        {
          $unset: { averageRating: "", totalReviews: "" },
        },
      )
      return
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
    const averageRating = totalRating / reviews.length

    await db.collection("products").updateOne(
      { _id: new ObjectId(productId) },
      {
        $set: {
          averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
          totalReviews: reviews.length,
        },
      },
    )
  } catch (error) {
    console.error("Update product rating error:", error)
  }
}

export async function deleteReview(reviewId: string) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return { error: "Unauthorized" }
  }

  try {
    const client = await clientPromise
    const db = client.db()

    const review = await db.collection("reviews").findOne({ _id: new ObjectId(reviewId) })
    if (!review) {
      return { error: "Review not found" }
    }

    // Only allow user to delete their own review or admin to delete any
    if (session.user.role !== "admin" && review.userId !== session.user.id) {
      return { error: "You can only delete your own reviews" }
    }

    await db.collection("reviews").deleteOne({ _id: new ObjectId(reviewId) })

    // Update product rating
    await updateProductRating(review.productId)

    revalidatePath(`/products/${review.productId}`)
    revalidatePath("/admin/reviews")

    return { success: "Review deleted successfully" }
  } catch (error) {
    console.error("Delete review error:", error)
    return { error: "Failed to delete review" }
  }
}
