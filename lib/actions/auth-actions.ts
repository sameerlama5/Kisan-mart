"use server"

const { hash } = require("bcrypt");
import clientPromise from "../mongodb"
import type { User } from "../db-models"

export async function registerUser(formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const role = formData.get("role") as "admin" | "farmer" | "user"
  const address = formData.get("address") as string
  const phone = formData.get("phone") as string

  if (!name || !email || !password || !role) {
    return { error: "Missing required fields" }
  }

  try {
    const client = await clientPromise
    const db = client.db()

    // Check if user already exists
    const existingUser = await db.collection("users").findOne({ email })
    if (existingUser) {
      return { error: "User already exists" }
    }

    // Hash password
    const hashedPassword = await hash(password, 10)

    // Create new user
    const newUser: User = {
      name,
      email,
      password: hashedPassword,
      role,
      address,
      phone,
      createdAt: new Date(),
    }

    await db.collection("users").insertOne(newUser)

    return { success: "User registered successfully" }
  } catch (error) {
    console.error("Registration error:", error)
    return { error: "Failed to register user" }
  }
}
