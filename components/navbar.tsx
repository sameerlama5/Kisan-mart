"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { getUnseenWarningsCount } from "@/lib/actions/notification-actions";

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const isActive = (path: string) => {
    return pathname === path;
  };

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: "/" });
  };

  const getDashboardLink = () => {
    if (!session?.user) return null;

    switch (session.user.role) {
      case "admin":
        return (
          <>
            <Link href="/admin/dashboard">
              <Button
                variant="ghost"
                className={isActive("/admin/dashboard") ? "bg-accent" : ""}
              >
                Dashboard
              </Button>
            </Link>
            <Link href="/admin/farmers">
              <Button
                variant="ghost"
                className={isActive("/admin/farmers") ? "bg-accent" : ""}
              >
                Farmers
              </Button>
            </Link>
            <Link href="/admin/reviews">
              <Button
                variant="ghost"
                className={isActive("/admin/reviews") ? "bg-accent" : ""}
              >
                Reviews
              </Button>
            </Link>
            <Link href="/admin/warnings">
              <Button
                variant="ghost"
                className={isActive("/admin/warnings") ? "bg-accent" : ""}
              >
                Warnings
              </Button>
            </Link>
          </>
        );
      case "farmer":
        // Only show farmer navigation if approved
        if (session.user.approvalStatus === "approved") {
          return (
            <>
              <Link href="/farmer/dashboard">
                <Button
                  variant="ghost"
                  className={
                    isActive("/farmer/dashboard")
                      ? "bg-primary-foreground/10"
                      : ""
                  }
                >
                  Dashboard
                </Button>
              </Link>
              <Link href="/farmer/products">
                <Button
                  variant="ghost"
                  className={
                    isActive("/farmer/products")
                      ? "bg-primary-foreground/10"
                      : ""
                  }
                >
                  Products
                </Button>
              </Link>
              <Link href="/farmer/orders">
                <Button
                  variant="ghost"
                  className={
                    isActive("/farmer/orders") ? "bg-primary-foreground/10" : ""
                  }
                >
                  Orders
                </Button>
              </Link>
              <Link href="/farmer/warnings">
                <Button
                  variant="ghost"
                  className={
                    isActive("/farmer/warnings")
                      ? "bg-primary-foreground/10"
                      : ""
                  }
                >
                  <span className="relative">
                    Warnings
                    <WarningNotificationBadge className="absolute -top-2 -right-2" />
                  </span>
                </Button>
              </Link>
              <Link href="/farmer/profile">
                <Button
                  variant="ghost"
                  className={
                    isActive("/farmer/profile")
                      ? "bg-primary-foreground/10"
                      : ""
                  }
                >
                  Profile
                </Button>
              </Link>
              <Link href="/farmer/tools">
                <Button
                  variant="ghost"
                  className={
                    isActive("/farmer/tools") ? "bg-primary-foreground/10" : ""
                  }
                >
                  Tools
                </Button>
              </Link>
              <Link href="/farmer/transactions">
                <Button
                  variant="ghost"
                  className={
                    isActive("/farmer/transactions")
                      ? "bg-primary-foreground/10"
                      : ""
                  }
                >
                  Transactions
                </Button>
              </Link>
            </>
          );
        } else {
          // Show pending status for unapproved farmers
          return (
            <Link href="/farmer/pending-approval">
              <Button
                variant="ghost"
                className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
              >
                Pending Approval
              </Button>
            </Link>
          );
        }
      case "user":
        return (
          <>
            <Link href="/orders">
              <Button
                variant="ghost"
                className={isActive("/orders") ? "bg-accent" : ""}
              >
                My Orders
              </Button>
            </Link>
            <Link href="/transactions">
              <Button
                variant="ghost"
                className={isActive("/transactions") ? "bg-accent" : ""}
              >
                Transactions
              </Button>
            </Link>
          </>
        );
      default:
        return null;
    }
  };

  const getMobileNavigation = () => {
    if (!session?.user) return null;

    if (
      session.user.role === "farmer" &&
      session.user.approvalStatus !== "approved"
    ) {
      return (
        <Link href="/farmer/pending-approval" onClick={toggleMenu}>
          <Button
            variant="ghost"
            className="w-full justify-start bg-yellow-100 text-yellow-800"
          >
            Pending Approval
          </Button>
        </Link>
      );
    }

    switch (session.user.role) {
      case "admin":
        return (
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
            <Link href="/admin/farmers" onClick={toggleMenu}>
              <Button variant="ghost" className="w-full justify-start">
                Manage Farmers
              </Button>
            </Link>
            <Link href="/admin/reviews" onClick={toggleMenu}>
              <Button variant="ghost" className="w-full justify-start">
                Manage Reviews
              </Button>
            </Link>
            <Link href="/admin/warnings" onClick={toggleMenu}>
              <Button variant="ghost" className="w-full justify-start">
                Manage Warnings
              </Button>
            </Link>
          </>
        );
      case "farmer":
        return (
          <>
            <Link href="/farmer/dashboard" onClick={toggleMenu}>
              <Button variant="ghost" className="w-full justify-start">
                Farmer Dashboard
              </Button>
            </Link>
            <Link href="/farmer/products" onClick={toggleMenu}>
              <Button variant="ghost" className="w-full justify-start">
                Products
              </Button>
            </Link>
            <Link href="/farmer/orders" onClick={toggleMenu}>
              <Button variant="ghost" className="w-full justify-start">
                Orders
              </Button>
            </Link>
            <Link href="/farmer/warnings" onClick={toggleMenu}>
              <Button variant="ghost" className="w-full justify-start">
                <span className="relative mr-2">
                  Warnings
                  <WarningNotificationBadge className="absolute -top-2 -right-2" />
                </span>
              </Button>
            </Link>
            <Link href="/farmer/profile" onClick={toggleMenu}>
              <Button variant="ghost" className="w-full justify-start">
                Profile
              </Button>
            </Link>
            <Link href="/farmer/tools" onClick={toggleMenu}>
              <Button variant="ghost" className="w-full justify-start">
                Tools
              </Button>
            </Link>
            <Link href="/farmer/transactions" onClick={toggleMenu}>
              <Button variant="ghost" className="w-full justify-start">
                Transactions
              </Button>
            </Link>
          </>
        );
      case "user":
        return (
          <>
            <Link href="/orders" onClick={toggleMenu}>
              <Button variant="ghost" className="w-full justify-start">
                My Orders
              </Button>
            </Link>
            <Link href="/transactions" onClick={toggleMenu}>
              <Button variant="ghost" className="w-full justify-start">
                Transactions
              </Button>
            </Link>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-primary text-primary-foreground supports-[backdrop-filter]:bg-primary/95">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="font-bold text-xl">
            KisanMart
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2 ml-6">
            <Link href="/">
              <Button
                variant="ghost"
                className={isActive("/") ? "bg-primary-foreground/10" : ""}
              >
                Home
              </Button>
            </Link>
            <Link href="/products">
              <Button
                variant="ghost"
                className={
                  isActive("/products") ? "bg-primary-foreground/10" : ""
                }
              >
                Products
              </Button>
            </Link>
            {getDashboardLink()}
          </nav>
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={toggleMenu}
        >
          {isMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </Button>

        {/* Desktop Right Side */}
        <div className="hidden md:flex items-center gap-2">
          {session?.user ? (
            <>
              {session.user.role === "user" && (
                <Link href="/cart">
                  <Button variant="ghost" size="icon" className="relative">
                    <ShoppingCart className="h-5 w-5" />
                    <CartQuantityIndicator />
                  </Button>
                </Link>
              )}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {session.user.name} ({session.user.role}
                  {session.user.role === "farmer" &&
                    session.user.approvalStatus !== "approved" &&
                    " - Pending"}
                  )
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
            <Link href="/transactions" onClick={toggleMenu}>
              <Button variant="ghost" className="w-full justify-start">
                Tansactions
              </Button>
            </Link>
            {session?.user && session.user.role === "user" && (
              <Link href="/cart" onClick={toggleMenu}>
                <Button variant="ghost" className="w-full justify-start">
                  Cart
                  <CartQuantityIndicator className="ml-2" />
                </Button>
              </Link>
            )}
            {getMobileNavigation()}
            {session?.user ? (
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={handleSignOut}
              >
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
  );
}

function CartQuantityIndicator({ className = "" }: { className?: string }) {
  const [quantity, setQuantity] = useState(0);

  useEffect(() => {
    // Function to fetch cart data
    const fetchCartQuantity = async () => {
      try {
        const response = await fetch("/api/cart/quantity");
        if (response.ok) {
          const data = await response.json();
          setQuantity(data.quantity);
        }
      } catch (error) {
        console.error("Failed to fetch cart quantity", error);
      }
    };

    // Fetch initially
    fetchCartQuantity();

    // Set up event listener for cart updates
    window.addEventListener("cart-updated", fetchCartQuantity);

    // Clean up
    return () => {
      window.removeEventListener("cart-updated", fetchCartQuantity);
    };
  }, []);

  if (quantity === 0) return null;

  return (
    <Badge
      className={`absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs h-5 min-w-5 flex items-center justify-center rounded-full ${className}`}
    >
      {quantity > 99 ? "99+" : quantity}
    </Badge>
  );
}

function WarningNotificationBadge({ className = "" }: { className?: string }) {
  const [count, setCount] = useState(0);
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user?.role === "farmer") {
      const fetchUnseenCount = async () => {
        try {
          const unseenCount = await getUnseenWarningsCount();
          setCount(unseenCount);
        } catch (error) {
          console.error("Failed to fetch unseen warnings count", error);
        }
      };

      fetchUnseenCount();

      // Set up interval to check for new warnings every minute
      const intervalId = setInterval(fetchUnseenCount, 60000);

      return () => clearInterval(intervalId);
    }
  }, [session]);

  if (count === 0) return null;

  return (
    <Badge
      className={`bg-red-500 text-white text-xs h-5 min-w-5 flex items-center justify-center rounded-full ${className}`}
    >
      {count > 99 ? "99+" : count}
    </Badge>
  );
}
