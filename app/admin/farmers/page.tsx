import { getPendingFarmers, getAllFarmers } from "@/lib/actions/farmer-approval-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import FarmerApprovalActions from "./farmer-approval-actions"

export default async function AdminFarmersPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login?callbackUrl=/admin/farmers")
  }

  if (session.user.role !== "admin") {
    redirect("/")
  }

  const pendingFarmers = await getPendingFarmers()
  const allFarmers = await getAllFarmers()

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Farmer Management</h1>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending">Pending Approval ({pendingFarmers.length})</TabsTrigger>
          <TabsTrigger value="all">All Farmers ({allFarmers.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Farmers Awaiting Approval</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingFarmers.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No farmers pending approval</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Name</th>
                        <th className="text-left py-3 px-4">Email</th>
                        <th className="text-left py-3 px-4">Phone</th>
                        <th className="text-left py-3 px-4">Address</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Registered</th>
                        <th className="text-left py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingFarmers.map((farmer: any) => (
                        <tr key={farmer._id} className="border-b">
                          <td className="py-3 px-4 font-medium">{farmer.name}</td>
                          <td className="py-3 px-4">{farmer.email}</td>
                          <td className="py-3 px-4">{farmer.phone || "N/A"}</td>
                          <td className="py-3 px-4">{farmer.address || "N/A"}</td>
                          <td className="py-3 px-4">
                            <Badge className="bg-yellow-500 text-white">{farmer.approvalStatus || "pending"}</Badge>
                          </td>
                          <td className="py-3 px-4">{formatDate(farmer.createdAt)}</td>
                          <td className="py-3 px-4">
                            <FarmerApprovalActions farmerId={farmer._id} farmerName={farmer.name} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Farmers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Name</th>
                      <th className="text-left py-3 px-4">Email</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Registered</th>
                      <th className="text-left py-3 px-4">Approved</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allFarmers.map((farmer: any) => (
                      <tr key={farmer._id} className="border-b">
                        <td className="py-3 px-4 font-medium">{farmer.name}</td>
                        <td className="py-3 px-4">{farmer.email}</td>
                        <td className="py-3 px-4">
                          <Badge
                            className={
                              farmer.approvalStatus === "approved"
                                ? "bg-green-500 text-white"
                                : farmer.approvalStatus === "rejected"
                                  ? "bg-red-500 text-white"
                                  : "bg-yellow-500 text-white"
                            }
                          >
                            {farmer.approvalStatus || "pending"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">{formatDate(farmer.createdAt)}</td>
                        <td className="py-3 px-4">{farmer.approvedAt ? formatDate(farmer.approvedAt) : "N/A"}</td>
                        <td className="py-3 px-4">
                          {farmer.approvalStatus !== "approved" && (
                            <FarmerApprovalActions farmerId={farmer._id} farmerName={farmer.name} />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
