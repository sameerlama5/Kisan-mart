import { getTransactionById } from "@/lib/actions/transaction-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Package, User, CreditCard, Calendar } from "lucide-react"

export default async function TransactionDetailsPage({ params }: { params: { id: string } }) {
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
        <Link href="/farmer/transactions">
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
                <div className="text-2xl font-bold mt-2">Rs. {transaction.farmerEarnings.toFixed(2)}</div>
                <p className="text-sm text-white">Your earnings</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-white" />
                <div>
                  <p className="text-sm text-white">Transaction Date</p>
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
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-white">Name</p>
                <p className="font-medium">{transaction.customerName}</p>
              </div>
              <div>
                <p className="text-sm text-white">Email</p>
                <p className="font-medium">{transaction.customerEmail}</p>
              </div>
              <div>
                <p className="text-sm text-white">Customer ID</p>
                <p className="font-mono text-sm">{transaction.customerId}</p>
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
                  <p className="text-sm text-white">Payer Email</p>
                  <p className="font-medium">{transaction.paymentDetails.payerEmail}</p>
                </div>
              )}
              {transaction.paymentDetails.payerName && (
                <div>
                  <p className="text-sm text-white">Payer Name</p>
                  <p className="font-medium">{transaction.paymentDetails.payerName}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Products */}
        <Card>
          <CardHeader>
            <CardTitle>Products Sold</CardTitle>
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

            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>Rs. {transaction.totalAmount.toFixed(2)}</span>
              </div>
              {transaction.platformFee && (
                <div className="flex justify-between text-sm text-white">
                  <span>Platform Fee</span>
                  <span>-Rs. {transaction.platformFee.toFixed(2)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-medium text-lg">
                <span>Your Earnings</span>
                <span>Rs. {transaction.farmerEarnings.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
