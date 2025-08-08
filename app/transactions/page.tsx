import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getUserTransactions } from "@/lib/actions/transaction-actions"

export default async function UserTransactionsPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "user") {
    redirect("/login")
  }

  const transactions = await getUserTransactions()

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case "failed":
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>
      case "refunded":
        return <Badge className="bg-gray-100 text-gray-800">Refunded</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case "PENDING":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case "FAILED":
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>
      case "CANCELLED":
        return <Badge className="bg-gray-100 text-gray-800">Cancelled</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const totalSpent = transactions.reduce((sum: number, transaction: any) => sum + transaction.totalAmount, 0)

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Transactions</h1>
        <p className="text-muted-foreground">View your purchase history and payment details</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs. {totalSpent.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactions.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No transactions found</p>
              <Link href="/products">
                <Button className="mt-4">Start Shopping</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction: any) => (
                <div key={transaction._id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-medium">Order from {transaction.farmerName}</h3>
                      <p className="text-sm text-white">
                        {new Date(transaction.createdAt).toLocaleDateString()} at{" "}
                        {new Date(transaction.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">Rs. {transaction.totalAmount.toFixed(2)}</div>
                      {getStatusBadge(transaction.status)}
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {transaction.products.map((product: any, index: number) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>
                          {product.productName} × {product.quantity}
                        </span>
                        <span>Rs. {product.totalPrice.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white">Payment:</span>
                      <span className="text-sm capitalize">{transaction.paymentMethod}</span>
                      {getPaymentStatusBadge(transaction.paymentDetails.paymentStatus)}
                    </div>
                    <Link href={`/transactions/${transaction._id}`}>
                      <Button className="text-primary" variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
