"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Eye, EyeOff, CheckCircle, AlertCircle, Camera, User } from "lucide-react"
import { updateProfile, changePassword, getUserProfile } from "@/lib/actions/profile-actions"

export default function FarmerProfilePage() {
  const { data: session, update } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)

  // Profile form state
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [bio, setBio] = useState("")
  const [farmName, setFarmName] = useState("")
  const [farmLocation, setFarmLocation] = useState("")
  const [profilePicture, setProfilePicture] = useState("")

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    if (session?.user?.id) {
      loadUserProfile()
    }
  }, [session])

  const loadUserProfile = async () => {
    if (!session?.user?.id) return

    const result = await getUserProfile(session.user.id)
    if (result.user) {
      const user = result.user
      setUserProfile(user)
      setName(user.name || "")
      setPhone(user.phone || "")
      setAddress(user.address || "")
      setBio(user.bio || "")
      setFarmName(user.farmName || "")
      setFarmLocation(user.farmLocation || "")
      setProfilePicture(user.profilePicture || "")
    }
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")

    const formData = new FormData()
    formData.append("name", name)
    formData.append("phone", phone)
    formData.append("address", address)
    formData.append("bio", bio)
    formData.append("farmName", farmName)
    formData.append("farmLocation", farmLocation)
    formData.append("profilePicture", profilePicture)

    const result = await updateProfile(formData)

    if (result.success) {
      setMessage(result.success)
      setIsSuccess(true)
      // Update session with new name
      await update({ name })
    } else if (result.error) {
      setMessage(result.error)
      setIsSuccess(false)
    }

    setIsLoading(false)
    setTimeout(() => setMessage(""), 5000)
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      setMessage("New passwords do not match")
      setIsSuccess(false)
      setTimeout(() => setMessage(""), 5000)
      return
    }

    if (newPassword.length < 6) {
      setMessage("New password must be at least 6 characters long")
      setIsSuccess(false)
      setTimeout(() => setMessage(""), 5000)
      return
    }

    setIsLoading(true)
    setMessage("")

    const result = await changePassword(currentPassword, newPassword)

    if (result.success) {
      setMessage(result.success)
      setIsSuccess(true)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } else if (result.error) {
      setMessage(result.error)
      setIsSuccess(false)
    }

    setIsLoading(false)
    setTimeout(() => setMessage(""), 5000)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfilePicture(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  if (!session) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      {message && (
        <Alert variant={isSuccess ? "default" : "destructive"} className="mb-6">
          {isSuccess ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile Information</TabsTrigger>
          <TabsTrigger value="password">Change Password</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription className="text-gray-300">Update your personal information and farm details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center space-x-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profilePicture || "/placeholder.svg"} alt={name} />
                    <AvatarFallback className="text-lg">
                      {name ? name.charAt(0).toUpperCase() : <User className="h-8 w-8" />}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Label htmlFor="profilePicture" className="cursor-pointer">
                      <div className="flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90">
                        <Camera className="h-4 w-4" />
                        <span>Change Photo</span>
                      </div>
                    </Label>
                    <Input
                      id="profilePicture"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <p className="text-sm text-gray-300 mt-2">JPG, PNG or GIF. Max size 5MB.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself and your farming experience..."
                    rows={4}
                  />
                </div>

                {session.user.role === "farmer" && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="farmName">Farm Name</Label>
                        <Input
                          id="farmName"
                          value={farmName}
                          onChange={(e) => setFarmName(e.target.value)}
                          placeholder="e.g., Green Valley Farm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="farmLocation">Farm Location</Label>
                        <Input
                          id="farmLocation"
                          value={farmLocation}
                          onChange={(e) => setFarmLocation(e.target.value)}
                          placeholder="e.g., Bhaktapur, Nepal"
                        />
                      </div>
                    </div>
                  </>
                )}

                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Updating..." : "Update Profile"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription className="text-gray-300">Update your password to keep your account secure</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="pr-10"
                      minLength={6}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="pr-10"
                      minLength={6}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Changing..." : "Change Password"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
