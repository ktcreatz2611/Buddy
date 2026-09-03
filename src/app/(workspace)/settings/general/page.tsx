"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LogOut } from "lucide-react"
import { signOut } from "next-auth/react"

export default function GeneralSettingsPage() {
  const [profile, setProfile] = React.useState<{ name: string; username: string; email: string } | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/auth/session')
        if (res.ok) {
          const data = await res.json()
          setProfile({
            name: data?.user?.name || '',
            username: data?.user?.username || '',
            email: data?.user?.email || '',
          })
        }
      } catch (e) {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="bg-zinc-950 p-6 text-zinc-100">
      <div className="mx-auto max-w-2xl space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">General Settings</h1>
          <p className="text-sm text-zinc-400">Manage your account and preferences.</p>
        </div>

        {/* Profile Info */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your account information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <p className="text-sm text-zinc-500">Loading...</p>
            ) : profile ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Name</label>
                  <p className="text-sm text-zinc-200 mt-1">{profile.name || '—'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Username</label>
                  <p className="text-sm text-zinc-200 mt-1">{profile.username || '—'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Email</label>
                  <p className="text-sm text-zinc-200 mt-1">{profile.email || '—'}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-zinc-500">Could not load profile.</p>
            )}
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="bg-zinc-900/50 border-red-900/50">
          <CardHeader>
            <CardTitle className="text-red-400">Sign Out</CardTitle>
            <CardDescription>Sign out of your Buddy account on this device.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="border-red-800 text-red-400 hover:bg-red-900/30 hover:text-red-300"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
