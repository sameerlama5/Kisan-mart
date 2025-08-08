import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Package, User, CreditCard, Calendar } from "lucide-react"
import { getTransactionById } from "@/lib/actions/transaction-actions"

export default async function UserTransactionDetailsPage({ params }: { params: { id: string } }) {
  const transaction = await getTransactionById(params.id)

  if (!transaction) {
    notFound()
  }

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

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Link href="/transactions">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Transactions
          </Button>
        </Link>
      </div>

      <div className="grid gap-6">
        {/* Transaction Overview */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">Transaction Details</CardTitle>
                <p className="text-white">Transaction ID: {transaction._id}</p>
              </div>
              <div className="text-right">
                {getStatusBadge(transaction.status)}
                <div className="text-2xl font-bold mt-2">Rs. {transaction.totalAmount.toFixed(2)}</div>
                <p className="text-sm text-white">Total paid</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-white">Purchase Date</p>
                  <p className="font-medium">{new Date(transaction.createdAt).toLocaleDateString()}</p>
                  <p className="text-sm text-white">
                    {new Date(transaction.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-white" />
                <div>
                  <p className="text-sm text-white">Order ID</p>
                  <p className="font-medium">{transaction.orderId}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-white" />
                <div>
                  <p className="text-sm text-white">Payment Method</p>
                  <p className="font-medium capitalize">{transaction.paymentMethod}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Farmer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Farmer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-white">Farmer Name</p>
                <p className="font-medium">{transaction.farmerName}</p>
              </div>
              <div>
                <p className="text-sm text-white">Farmer ID</p>
                <p className="font-mono text-sm">{transaction.farmerId}</p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-white">Payment ID</p>
                <p className="font-mono text-sm">{transaction.paymentDetails.paymentId}</p>
              </div>
              <div>
                <p className="text-sm text-white">Payment Status</p>
                {getPaymentStatusBadge(transaction.paymentDetails.paymentStatus)}
              </div>
              {transaction.paymentDetails.payerEmail && (
                <div>
                  <p className="text-sm text-white">Your PayPal Email</p>
                  <p className="font-medium">{transaction.paymentDetails.payerEmail}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Products */}
        <Card>
          <CardHeader>
            <CardTitle>Products Purchased</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transaction.products.map((product: any, index: number) => (
                <div key={index}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium">{product.productName}</h4>
                      <p className="text-sm text-white">
                        Quantity: {product.quantity} × Rs. {product.unitPrice.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">Rs. {product.totalPrice.toFixed(2)}</p>
                    </div>
                  </div>
                  {index < transaction.products.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </div>

            <Separator className="my-6" />

            <div className="flex justify-between font-medium text-lg">
              <span>Total Paid</span>
              <span>Rs. {transaction.totalAmount.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
