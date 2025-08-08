import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Clock, Mail, AlertCircle, CheckCircle } from "lucide-react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function PendingApprovalPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  if (session.user.role !== "farmer") {
    redirect("/")
  }

  // If farmer is already approved, redirect to dashboard
  if (session.user.approvalStatus === "approved") {
    redirect("/farmer/dashboard")
  }

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-8rem)] py-8">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
          <CardTitle className="text-2xl">Account Pending Approval</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <span className="font-medium text-yellow-800">Approval Required</span>
            </div>
            <p className="text-sm text-yellow-700">
              Your farmer account is currently under review by our admin team. You cannot access farmer features until
              your account is approved.
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-md">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Mail className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Email Notification</span>
              </div>
              <p className="text-xs text-muted">
                You will receive an email notification once your account has been approved.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-medium">What happens next:</h3>
              <div className="space-y-2">
                <div className="flex items-start gap-3 text-sm">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-xs font-medium">
                    1
                  </div>
                  <span className="text-muted">Admin team reviews your farmer application</span>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-xs font-medium">
                    2
                  </div>
                  <span className="text-muted">Email notification sent upon approval</span>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600 text-xs font-medium">
                    <CheckCircle className="h-3 w-3" />
                  </div>
                  <span className="text-muted">Access to farmer dashboard and all features</span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-2">Once Approved, You Can:</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Add and manage your farm products</li>
                <li>• Set prices and manage inventory</li>
                <li>• Receive and process customer orders</li>
                <li>• Use farmer tools for price optimization</li>
                <li>• Track sales and analytics</li>
              </ul>
            </div>
          </div>

          <div className="pt-4 space-y-3">
            <p className="text-xs text-muted">
              Approval typically takes 1-2 business days. If you have questions, please contact our support team.
            </p>
            <div className="flex gap-2">
              <Link href="/" className="flex-1">
                <Button variant="outline" className="w-full text-primary">
                  Return to Homepage
                </Button>
              </Link>
              <Link href="/products" className="flex-1">
                <Button variant="outline" className="w-full text-primary">
                  Browse Products
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
