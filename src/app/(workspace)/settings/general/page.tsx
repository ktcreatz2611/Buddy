import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { auth } from "@/lib/auth"
import { SignOutButton } from "./sign-out-button"

export default async function GeneralSettingsPage() {
  const session = await auth()
  const profile = session?.user

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">General Settings</h1>
        <p className="text-sm text-zinc-400 mt-1">Manage your account and preferences.</p>
      </div>

      {/* Profile Info */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your account information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Name</label>
              <p className="text-sm text-zinc-200 mt-1">{profile?.name || '—'}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Username</label>
              <p className="text-sm text-zinc-200 mt-1">{(profile as any)?.username || '—'}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Email</label>
              <p className="text-sm text-zinc-200 mt-1">{profile?.email || '—'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="bg-zinc-900/50 border-red-900/50">
        <CardHeader>
          <CardTitle className="text-red-400">Sign Out</CardTitle>
          <CardDescription>Sign out of your Buddy account on this device.</CardDescription>
        </CardHeader>
        <CardContent>
          <SignOutButton />
        </CardContent>
      </Card>
    </div>
  )
}
