import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  const { pathname } = request.nextUrl

  // Define protected routes by role
  const adminRoutes = ["/admin"]
  const farmerRoutes = ["/farmer"]
  const userRoutes = ["/cart", "/orders"]

  // Check if the path is protected
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route))
  const isFarmerRoute = farmerRoutes.some((route) => pathname.startsWith(route))
  const isUserRoute = userRoutes.some((route) => pathname.startsWith(route))

  // Allow access to pending approval page for farmers
  if (pathname === "/farmer/pending-approval") {
    if (!token || token.role !== "farmer") {
      return NextResponse.redirect(new URL("/login", request.url))
    }
    return NextResponse.next()
  }

  // Redirect logic based on authentication and role
  if (!token) {
    // If not logged in and trying to access protected route
    if (isAdminRoute || isFarmerRoute || isUserRoute) {
      return NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, request.url))
    }
  } else {
    // If logged in but trying to access route for different role
    if (isAdminRoute && token.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url))
    }

    if (isFarmerRoute && token.role !== "farmer") {
      return NextResponse.redirect(new URL("/", request.url))
    }

    // STRICT CHECK: If farmer is not approved, redirect to pending page
    if (isFarmerRoute && token.role === "farmer" && token.approvalStatus !== "approved") {
      return NextResponse.redirect(new URL("/farmer/pending-approval", request.url))
    }

    if (isUserRoute && token.role !== "user") {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  return NextResponse.next()
}

// Configure which paths the middleware runs on
export const config = {
  matcher: ["/admin/:path*", "/farmer/:path*", "/cart/:path*", "/orders/:path*"],
}
