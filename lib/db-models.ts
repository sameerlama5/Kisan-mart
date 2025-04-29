export interface User {
  _id?: string
  name: string
  email: string
  password: string
  role: "admin" | "farmer" | "user"
  address?: string
  phone?: string
  createdAt: Date
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
