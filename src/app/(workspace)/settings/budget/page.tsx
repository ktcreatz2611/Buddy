"use client"

import * as React from "react"
import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { Save, AlertCircle } from "lucide-react"

export default function BudgetSettingsPage() {
  const [loading, setLoading] = useState(false)
  const [dailyEnabled, setDailyEnabled] = useState(false)
  const [monthlyEnabled, setMonthlyEnabled] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setLoading(false)
  }

  // Default empty state usage data
  const dailyTokensUsed = 0
  const dailyTokenLimit = 100000
  const dailyPercent = 0

  const monthlyCostUsed = 0
  const monthlyCostLimit = 50.00
  const monthlyPercent = 0

  const getProgressColor = (percent: number) => {
    if (percent > 80) return "bg-red-500"
    if (percent > 60) return "bg-yellow-500"
    return "bg-green-500"
  }

  return (
    <div className="space-y-8 text-zinc-100">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Budget & Limits</h1>
        <p className="text-sm text-zinc-400 mt-1">Configure usage limits to control your AI spending.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {/* Current Usage Summary */}
        <Card className="bg-zinc-950 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg">Daily Usage</CardTitle>
            <CardDescription>Tokens used today</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">{dailyTokensUsed.toLocaleString()} tokens</span>
              <span className="font-medium text-zinc-200">{dailyTokenLimit.toLocaleString()} limit</span>
            </div>
            <Progress 
              value={dailyPercent} 
              className="h-2 bg-zinc-800"
              indicatorClassName={getProgressColor(dailyPercent)}
            />
            <p className="text-xs text-zinc-500 text-right">{dailyPercent.toFixed(1)}%</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-950 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg">Monthly Usage</CardTitle>
            <CardDescription>Estimated cost this month</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">${monthlyCostUsed.toFixed(2)}</span>
              <span className="font-medium text-zinc-200">${monthlyCostLimit.toFixed(2)} limit</span>
            </div>
            <Progress 
              value={monthlyPercent} 
              className="h-2 bg-zinc-800"
              indicatorClassName={getProgressColor(monthlyPercent)}
            />
            <p className="text-xs text-zinc-500 text-right">{monthlyPercent.toFixed(1)}%</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-zinc-950 border-zinc-800">
        <CardHeader>
          <CardTitle>Usage Limits Configuration</CardTitle>
          <CardDescription>Set hard limits for tokens and cost. Requests will be blocked when limits are reached.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          
          {/* Daily Limits */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <Label className="text-base text-zinc-200">Daily Limits</Label>
                <p className="text-sm text-zinc-500">Reset at midnight UTC</p>
              </div>
              <Switch checked={dailyEnabled} onCheckedChange={setDailyEnabled} />
            </div>
            
            <div className={cn("grid gap-4 md:grid-cols-2", !dailyEnabled && "opacity-50 pointer-events-none")}>
              <div className="space-y-2">
                <Label htmlFor="daily-tokens">Token Limit</Label>
                <div className="relative">
                  <Input 
                    id="daily-tokens" 
                    type="number" 
                    defaultValue="100000" 
                    className="bg-zinc-900 border-zinc-800 focus-visible:ring-indigo-500"
                  />
                  <div className="absolute inset-y-0 right-3 flex items-center text-xs text-zinc-500 pointer-events-none">
                    tokens
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="daily-cost">Cost Limit</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center text-zinc-500 pointer-events-none">
                    $
                  </div>
                  <Input 
                    id="daily-cost" 
                    type="number" 
                    defaultValue="5.00" 
                    step="0.01"
                    className="bg-zinc-900 border-zinc-800 pl-7 focus-visible:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Limits */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <Label className="text-base text-zinc-200">Monthly Limits</Label>
                <p className="text-sm text-zinc-500">Reset on the 1st of each month</p>
              </div>
              <Switch checked={monthlyEnabled} onCheckedChange={setMonthlyEnabled} />
            </div>
            
            <div className={cn("grid gap-4 md:grid-cols-2", !monthlyEnabled && "opacity-50 pointer-events-none")}>
              <div className="space-y-2">
                <Label htmlFor="monthly-tokens">Token Limit</Label>
                <div className="relative">
                  <Input 
                    id="monthly-tokens" 
                    type="number" 
                    defaultValue="2000000" 
                    className="bg-zinc-900 border-zinc-800 focus-visible:ring-indigo-500"
                  />
                  <div className="absolute inset-y-0 right-3 flex items-center text-xs text-zinc-500 pointer-events-none">
                    tokens
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="monthly-cost">Cost Limit</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center text-zinc-500 pointer-events-none">
                    $
                  </div>
                  <Input 
                    id="monthly-cost" 
                    type="number" 
                    defaultValue="50.00" 
                    step="0.01"
                    className="bg-zinc-900 border-zinc-800 pl-7 focus-visible:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Warnings */}
          <div className="space-y-4 pt-4 border-t border-zinc-800">
            <Label htmlFor="warning-threshold" className="text-base">Warning Threshold</Label>
            <p className="text-sm text-zinc-500">Show a visual warning when usage reaches this percentage of the limit.</p>
            <div className="flex items-center gap-4 max-w-xs">
              <Input 
                id="warning-threshold" 
                type="number" 
                defaultValue="80" 
                max="100"
                min="1"
                className="bg-zinc-900 border-zinc-800 focus-visible:ring-indigo-500 w-24"
              />
              <span className="text-zinc-400">%</span>
            </div>
          </div>

        </CardContent>
        <CardFooter className="flex justify-between border-t border-zinc-800 pt-6">
          <div className="flex items-center text-sm text-zinc-400">
            <AlertCircle className="mr-2 h-4 w-4 text-zinc-500" />
            Changes take effect immediately
          </div>
          <Button 
            onClick={handleSave} 
            disabled={loading}
            className="bg-indigo-600 text-white hover:bg-indigo-700"
          >
            {loading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-white" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Preferences
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
