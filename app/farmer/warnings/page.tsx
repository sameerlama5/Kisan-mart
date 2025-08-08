import { getFarmerWarnings } from "@/lib/actions/warning-actions"
import { markWarningsAsSeen } from "@/lib/actions/notification-actions"
import WarningResponseForm from "./warning-response-form"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"

export default async function FarmerWarningsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== "farmer") {
    redirect("/login")
  }

  const warnings = await getFarmerWarnings()

  // Mark all warnings as seen when the page is loaded
  await markWarningsAsSeen()

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="destructive">Active</Badge>
      case "under_review":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Under Review
          </Badge>
        )
      case "resolved":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
            Resolved
          </Badge>
        )
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "low":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            Low
          </Badge>
        )
      case "medium":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Medium
          </Badge>
        )
      case "high":
        return <Badge variant="destructive">High</Badge>
      default:
        return <Badge>{severity}</Badge>
    }
  }

  const getResponseTypeBadge = (type: string) => {
    switch (type) {
      case "explanation":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            Explanation
          </Badge>
        )
      case "action_plan":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
            Action Plan
          </Badge>
        )
      case "appeal":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Appeal
          </Badge>
        )
      case "acknowledgment":
        return <Badge variant="outline">Acknowledgment</Badge>
      default:
        return <Badge>{type}</Badge>
    }
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Warnings</h1>

      {warnings.length === 0 ? (
        <div className="bg-green-50 p-6 rounded-lg text-center">
          <p className="text-green-800 text-lg">You have no warnings. Keep up the good work!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {warnings.map((warning: any) => (
            <Card key={warning._id} className={warning.status === "active" ? "border-red-200" : ""}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      Warning {getStatusBadge(warning.status)} {getSeverityBadge(warning.severity)}
                    </CardTitle>
                    <CardDescription>
                      Issued by {warning.adminName} •{" "}
                      {formatDistanceToNow(new Date(warning.createdAt), { addSuffix: true })}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-red-50 p-4 rounded-md">
                  <h3 className="font-medium text-red-800 mb-1">Reason for Warning:</h3>
                  <p className="text-gray-700">{warning.reason}</p>
                </div>

                {warning.farmerResponse ? (
                  <div className="bg-blue-50 p-4 rounded-md">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium text-blue-800">Your Response:</h3>
                      <div className="flex items-center gap-2">
                        {getResponseTypeBadge(warning.farmerResponse.responseType)}
                        <span className="text-sm text-gray-500">
                          {formatDistanceToNow(new Date(warning.farmerResponse.respondedAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-700">{warning.farmerResponse.message}</p>
                    {warning.farmerResponse.actionPlan && (
                      <div className="mt-2">
                        <h4 className="font-medium text-blue-800">Action Plan:</h4>
                        <p className="text-gray-700">{warning.farmerResponse.actionPlan}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  warning.status === "active" && <WarningResponseForm warningId={warning._id} />
                )}

                {warning.adminReply && (
                  <div className="bg-green-50 p-4 rounded-md">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium text-green-800">Admin Response:</h3>
                      <span className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(warning.adminRepliedAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-gray-700">{warning.adminReply}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
