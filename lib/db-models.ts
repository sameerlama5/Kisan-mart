export interface User {
  _id?: string
  name: string
  email: string
  password: string
  role: "admin" | "farmer" | "user"
  address?: string
  phone?: string
  profilePicture?: string
  bio?: string
  farmName?: string
  farmLocation?: string
  approvalStatus?: "pending" | "approved" | "rejected"
  approvedAt?: Date
  approvedBy?: string
  rejectionReason?: string
  warnings?: Warning[]
  resetToken?: string
  resetTokenExpiry?: Date
  createdAt: Date
  updatedAt?: Date
}

export interface Product {
  _id?: string
  name: string
  description: string
  price: number
  stock: number
  category: string
  images: string[]
  farmerId: string
  farmerName: string
  averageRating?: number
  totalReviews?: number
  createdAt: Date
  updatedAt: Date
}

export interface Order {
  _id?: string
  userId: string
  userName: string
  products: {
    productId: string
    name: string
    price: number
    quantity: number
  }[]
  totalAmount: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  shippingAddress: string
  paymentMethod: string
  paymentDetails?: {
    paymentId?: string
    paymentStatus?: string
    payerEmail?: string
    payerName?: string
  }
  createdAt: Date
  updatedAt: Date
}

export interface Cart {
  _id?: string
  userId: string
  products: {
    productId: string
    name: string
    price: number
    quantity: number
  }[]
  createdAt: Date
  updatedAt: Date
}

export interface Review {
  _id?: string
  productId: string
  productName: string
  userId: string
  userName: string
  rating: number 
  comment: string
  status: "pending" | "approved" | "rejected" | "flagged"
  moderatedBy?: string
  moderationReason?: string
  moderatedAt?: Date
  isVerifiedPurchase: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Warning {
  _id?: string
  farmerId: string
  farmerName: string
  adminId: string
  adminName: string
  reason: string
  reviewId?: string 
  severity: "low" | "medium" | "high"
  status: "active" | "resolved" | "appealed" | "under_review"
  farmerResponse?: FarmerResponse
  adminReply?: string
  adminRepliedAt?: Date
  seenByFarmer?: Date
  createdAt: Date
  resolvedAt?: Date
}

export interface FarmerResponse {
  message: string
  actionPlan?: string
  responseType: "explanation" | "action_plan" | "appeal" | "acknowledgment"
  respondedAt: Date
  attachments?: string[] 
}

export interface Transaction {
  _id?: string
  orderId: string
  farmerId: string
  farmerName: string
  customerId: string
  customerName: string
  customerEmail: string
  products: {
    productId: string
    productName: string
    quantity: number
    unitPrice: number
    totalPrice: number
  }[]
  totalAmount: number
  farmerEarnings: number 
  platformFee?: number
  paymentMethod: "paypal" | "cash" | "bank_transfer"
  paymentDetails: {
    paymentId: string
    paymentStatus: "COMPLETED" | "PENDING" | "FAILED" | "CANCELLED"
    payerEmail?: string
    payerName?: string
    transactionFee?: number
  }
  status: "completed" | "pending" | "failed" | "refunded"
  createdAt: Date
  updatedAt: Date
}

export interface MarketData {
  _id?: string
  category: string
  avgPrice: number
  minPrice: number
  maxPrice: number
  demandScore: number 
  seasonalityFactor: number
  lastUpdatedBy: string
  lastUpdatedByName: string
  createdAt: Date
  updatedAt: Date
}
