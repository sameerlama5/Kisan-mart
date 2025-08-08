import { getAllWarnings } from "@/lib/actions/warning-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { AlertTriangle, MessageCircle, Clock, CheckCircle } from "lucide-react"
import WarningActions from "./warning-actions"
import AdminReplyForm from "./admin-reply-form"

export default async function AdminWarningsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login?callbackUrl=/admin/warnings")
  }

  if (session.user.role !== "admin") {
    redirect("/")
  }

  const warnings = await getAllWarnings()
  const activeWarnings = warnings.filter((w: any) => w.status === "active")
  const underReviewWarnings = warnings.filter((w: any) => w.status === "under_review")
  const resolvedWarnings = warnings.filter((w: any) => w.status === "resolved")

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <AlertTriangle className="h-5 w-5 text-orange-500" />
      case "under_review":
        return <Clock className="h-5 w-5 text-blue-500" />
      case "resolved":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "destructive"
      case "under_review":
        return "default"
      case "resolved":
        return "secondary"
      default:
        return "secondary"
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "secondary"
    }
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Warning Management</h1>

      <div className="grid gap-6">
        {/* Warnings Under Review */}
        {underReviewWarnings.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                Awaiting Admin Review ({underReviewWarnings.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {underReviewWarnings.map((warning: any) => (
                  <div key={warning._id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium">{warning.farmerName}</h3>
                        <p className="text-sm text-muted-foreground">Issued by {warning.adminName}</p>
                        <p className="text-sm text-muted-foreground">{formatDate(warning.createdAt)}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={getSeverityColor(warning.severity)}>{warning.severity} severity</Badge>
                        <Badge variant={getStatusColor(warning.status)}>{warning.status.replace("_", " ")}</Badge>
                      </div>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
                      <h4 className="font-medium text-red-800 mb-1">Warning Reason:</h4>
                      <p className="text-sm text-red-700">{warning.reason}</p>
                    </div>

                    {warning.farmerResponse && (
                      <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
                        <h4 className="font-medium text-blue-800 mb-1 flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          Farmer Response ({warning.farmerResponse.responseType.replace("_", " ")}):
                        </h4>
                        <p className="text-sm text-blue-700 mb-2">{warning.farmerResponse.message}</p>
                        {warning.farmerResponse.actionPlan && (
                          <div>
                            <p className="text-sm font-medium text-blue-800">Action Plan:</p>
                            <p className="text-sm text-blue-700">{warning.farmerResponse.actionPlan}</p>
                          </div>
                        )}
                        <p className="text-xs text-blue-600 mt-2">
                          Responded on {formatDate(warning.farmerResponse.respondedAt)}
                        </p>
                      </div>
                    )}

                    <AdminReplyForm warningId={warning._id} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Warnings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Active Warnings ({activeWarnings.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeWarnings.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No active warnings</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeWarnings.map((warning: any) => (
                  <div key={warning._id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-medium">{warning.farmerName}</h3>
                        <p className="text-sm text-muted-foreground">Issued by {warning.adminName}</p>
                        <p className="text-sm text-muted-foreground">{formatDate(warning.createdAt)}</p>
                      </div>
                      <Badge variant={getSeverityColor(warning.severity)}>{warning.severity} severity</Badge>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded p-3 mb-3">
                      <p className="text-sm text-red-700">{warning.reason}</p>
                    </div>

                    {warning.farmerResponse ? (
                      <div className="space-y-3">
                        <div className="bg-blue-50 border border-blue-200 rounded p-3">
                          <h4 className="font-medium text-blue-800 mb-1 flex items-center gap-1">
                            <MessageCircle className="h-4 w-4" />
                            Farmer Response ({warning.farmerResponse.responseType.replace("_", " ")}):
                          </h4>
                          <p className="text-sm text-blue-700 mb-2">{warning.farmerResponse.message}</p>
                          {warning.farmerResponse.actionPlan && (
                            <div>
                              <p className="text-sm font-medium text-blue-800">Action Plan:</p>
                              <p className="text-sm text-blue-700">{warning.farmerResponse.actionPlan}</p>
                            </div>
                          )}
                        </div>
                        <AdminReplyForm warningId={warning._id} />
                      </div>
                    ) : (
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-muted-foreground">Awaiting farmer response</p>
                        <WarningActions warningId={warning._id} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resolved Warnings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Resolved Warnings ({resolvedWarnings.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {resolvedWarnings.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No resolved warnings</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {resolvedWarnings.map((warning: any) => (
                  <div key={warning._id} className="border rounded-lg p-4 opacity-75">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-medium">{warning.farmerName}</h3>
                        <p className="text-sm text-muted-foreground">Resolved: {formatDate(warning.resolvedAt)}</p>
                      </div>
                      <Badge variant="outline">{warning.severity} severity</Badge>
                    </div>
                    <p className="text-sm mb-3">{warning.reason}</p>

                    {warning.farmerResponse && (
                      <div className="bg-gray-50 border rounded p-3 mb-3">
                        <h4 className="font-medium text-gray-800 mb-1">Farmer Response:</h4>
                        <p className="text-sm text-gray-700">{warning.farmerResponse.message}</p>
                      </div>
                    )}

                    {warning.adminReply && (
                      <div className="bg-gray-50 border rounded p-3">
                        <h4 className="font-medium text-gray-800 mb-1">Admin Reply:</h4>
                        <p className="text-sm text-gray-700">{warning.adminReply}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
