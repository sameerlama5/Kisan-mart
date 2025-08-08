"use server"

const { hash } = require("bcryptjs");
import clientPromise from "../mongodb"
import type { User } from "../db-models"
import { sendEmail, emailTemplates } from "../nodemailer"

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

    // Set approval status based on role
    if (role === "farmer") {
      newUser.approvalStatus = "pending"
    } else {
      newUser.approvalStatus = "approved" // Auto-approve non-farmers
    }

    const result = await db.collection("users").insertOne(newUser)

    console.log("User registered successfully:", {
      id: result.insertedId.toString(),
      email,
      role,
      approvalStatus: newUser.approvalStatus,
    })

    // Send email notification for farmers
    if (role === "farmer") {
      try {
        const template = emailTemplates.farmerApprovalPending(name)
        await sendEmail(email, template.subject, template.html)
        console.log("Pending approval email sent to:", email)
      } catch (emailError) {
        console.error("Failed to send pending approval email:", emailError)
        // Don't fail registration if email fails
      }
    }

    return {
      success: "User registered successfully",
      requiresApproval: role === "farmer",
    }
  } catch (error) {
    console.error("Registration error:", error)
    return { error: "Failed to register user" }
  }
}

// Add a test function to check if a user exists and can be authenticated
export async function checkUserCredentials(email: string, password: string) {
  try {
    const client = await clientPromise
    const db = client.db()

    const user = await db.collection("users").findOne({ email })

    if (!user) {
      return { error: "User not found" }
    }

    // Don't return the password in the response
    const { password: _, ...userWithoutPassword } = user

    return {
      success: "User found",
      user: userWithoutPassword,
    }
  } catch (error) {
    console.error("Check user error:", error)
    return { error: "Failed to check user" }
  }
}
