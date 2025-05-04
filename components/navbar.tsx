"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ShoppingCart, LogOut, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSession, signOut } from "next-auth/react"
import { useState } from "react"

export default function Navbar() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  const isActive = (path: string) => {
    return pathname === path
  }

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: "/" })
  }

  const getDashboardLink = () => {
    if (!session?.user) return null

    switch (session.user.role) {
      case "admin":
        return (
          <Link href="/admin/dashboard">
            <Button variant="ghost" className={isActive("/admin/dashboard") ? "bg-accent" : ""}>
              Dashboard
            </Button>
          </Link>
        )
      case "farmer":
        return (
          <>
            <Link href="/farmer/dashboard">
              <Button variant="ghost" className={isActive("/farmer/dashboard") ? "bg-primary-foreground/10" : ""}>
                Dashboard
              </Button>
            </Link>
            <Link href="/farmer/orders">
              <Button variant="ghost" className={isActive("/farmer/orders") ? "bg-primary-foreground/10" : ""}>
                Orders
              </Button>
            </Link>
          </>
        )
      case "user":
        return (
          <Link href="/orders">
            <Button variant="ghost" className={isActive("/orders") ? "bg-accent" : ""}>
              My Orders
            </Button>
          </Link>
        )
      default:
        return null
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-primary text-primary-foreground supports-[backdrop-filter]:bg-primary/95">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="font-bold text-xl">
            FarmerWeb
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2 ml-6">
            <Link href="/">
              <Button variant="ghost" className={isActive("/") ? "bg-primary-foreground/10" : ""}>
                Home
              </Button>
            </Link>
            <Link href="/products">
              <Button variant="ghost" className={isActive("/products") ? "bg-primary-foreground/10" : ""}>
                Products
              </Button>
            </Link>
            {getDashboardLink()}
          </nav>
        </div>

        {/* Mobile Menu Button */}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMenu}>
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>

        {/* Desktop Right Side */}
        <div className="hidden md:flex items-center gap-2">
          {session?.user ? (
            <>
              {session.user.role === "user" && (
                <Link href="/cart">
                  <Button variant="ghost" size="icon">
                    <ShoppingCart className="h-5 w-5" />
                  </Button>
                </Link>
              )}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {session.user.name} ({session.user.role})
                </span>
                <Button variant="ghost" size="icon" onClick={handleSignOut}>
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/register">
                <Button variant="secondary">Register</Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden p-4 border-t bg-primary">
          <nav className="flex flex-col space-y-3">
            <Link href="/" onClick={toggleMenu}>
              <Button variant="ghost" className="w-full justify-start">
                Home
              </Button>
            </Link>
            <Link href="/products" onClick={toggleMenu}>
              <Button variant="ghost" className="w-full justify-start">
                Products
              </Button>
            </Link>
            {session?.user && session.user.role === "user" && (
              <Link href="/cart" onClick={toggleMenu}>
                <Button variant="ghost" className="w-full justify-start">
                  Cart
                </Button>
              </Link>
            )}
            {session?.user && session.user.role === "admin" && (
              <>
                <Link href="/admin/dashboard" onClick={toggleMenu}>
                  <Button variant="ghost" className="w-full justify-start">
                    Admin Dashboard
                  </Button>
                </Link>
                <Link href="/admin/products" onClick={toggleMenu}>
                  <Button variant="ghost" className="w-full justify-start">
                    All Products
                  </Button>
                </Link>
                <Link href="/admin/orders" onClick={toggleMenu}>
                  <Button variant="ghost" className="w-full justify-start">
                    All Orders
                  </Button>
                </Link>
                <Link href="/admin/users" onClick={toggleMenu}>
                  <Button variant="ghost" className="w-full justify-start">
                    Manage Users
                  </Button>
                </Link>
              </>
            )}
            {session?.user && session.user.role === "farmer" && (
              <>
                <Link href="/farmer/dashboard" onClick={toggleMenu}>
                  <Button variant="ghost" className="w-full justify-start">
                    Farmer Dashboard
                  </Button>
                </Link>
                <Link href="/farmer/orders" onClick={toggleMenu}>
                  <Button variant="ghost" className="w-full justify-start">
                    Orders
                  </Button>
                </Link>
              </>
            )}
            {session?.user && session.user.role === "user" && (
              <Link href="/orders" onClick={toggleMenu}>
                <Button variant="ghost" className="w-full justify-start">
                  My Orders
                </Button>
              </Link>
            )}
            {session?.user ? (
              <Button variant="ghost" className="w-full justify-start" onClick={handleSignOut}>
                Logout
              </Button>
            ) : (
              <>
                <Link href="/login" onClick={toggleMenu}>
                  <Button variant="ghost" className="w-full justify-start">
                    Login
                  </Button>
                </Link>
                <Link href="/register" onClick={toggleMenu}>
                  <Button variant="ghost" className="w-full justify-start">
                    Register
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
