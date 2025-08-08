"use client"

import type React from "react"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { AlertCircle, Clock, Eye, EyeOff } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      console.log("Login attempt with email:", email)

      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      })

      console.log("Login result:", result)

      if (result?.error) {
        setError("Invalid email or password")
        setIsLoading(false)
        return
      }

      if (result?.ok) {
        // Check if user is a farmer and handle approval status
        try {
          const response = await fetch("/api/auth/check-approval", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          })

          if (response.ok) {
            const data = await response.json()
            if (data.user?.role === "farmer") {
              if (data.user?.approvalStatus === "pending") {
                // Redirect to pending approval page for pending farmers
                router.push("/farmer/pending-approval")
                return
              } else if (data.user?.approvalStatus === "rejected") {
                setError("Your farmer account application was rejected. Please contact support for more information.")
                setIsLoading(false)
                return
              }
            }
          }
        } catch (error) {
          console.error("Error checking approval status:", error)
        }

        // Redirect to the callback URL or appropriate dashboard
        if (callbackUrl && callbackUrl !== "/") {
          router.push(callbackUrl)
        } else {
          // Redirect based on role
          const response = await fetch("/api/auth/check-approval", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          })

          if (response.ok) {
            const data = await response.json()
            if (data.user?.role === "admin") {
              router.push("/admin/dashboard")
            } else if (data.user?.role === "farmer" && data.user?.approvalStatus === "approved") {
              router.push("/farmer/dashboard")
            } else if (data.user?.role === "user") {
              router.push("/")
            } else {
              router.push("/")
            }
          } else {
            router.push("/")
          }
        }
        router.refresh()
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("Something went wrong. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-8rem)] py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Login</CardTitle>
          <CardDescription className="text-gray-300">Enter your email and password to login to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant={error.includes("pending") ? "default" : "destructive"}>
                {error.includes("pending") ? <Clock className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-sm text-gray-300 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-gray-300">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-blue-500 hover:underline">
              Register
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
