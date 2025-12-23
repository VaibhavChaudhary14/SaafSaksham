"use client"

import type { Profile } from "@/lib/types/database"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Coins, Search, Gift, ShoppingBag, Heart, DollarSign, Award, Loader2, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface CSRPartner {
  id: string
  name: string
  description: string
  logo_url: string | null
  reward_types: string[]
  is_active: boolean
}

interface RewardsCatalogProps {
  profile: Profile
  partners: CSRPartner[]
}

import { rewardsService } from "@/lib/services/rewards-service"
import type { RedemptionOption } from "@/lib/types/database"
import { useEffect } from "react"
// ... imports ...

export default function RewardsCatalog({ profile, partners }: RewardsCatalogProps) {
  const router = useRouter()
  const [rewards, setRewards] = useState<RedemptionOption[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [selectedReward, setSelectedReward] = useState<RedemptionOption | null>(null)
  const [isRedeeming, setIsRedeeming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    const fetchRewards = async () => {
      try {
        const data = await rewardsService.getRewards()
        setRewards(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchRewards()
  }, [])

  const filteredRewards = rewards.filter((reward) => {
    const matchesSearch = reward.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === "all" || reward.category === typeFilter
    return matchesSearch && matchesType
  })

  // Helper to map icon names to components
  const getIcon = (iconName?: string | null) => {
    switch (iconName) {
      case "ShoppingBag": return <ShoppingBag className="h-8 w-8" />
      case "Gift": return <Gift className="h-8 w-8" />
      case "Heart": return <Heart className="h-8 w-8" />
      case "DollarSign": return <DollarSign className="h-8 w-8" />
      case "Award": return <Award className="h-8 w-8" />
      default: return <Gift className="h-8 w-8" />
    }
  }

  const handleRedeem = async () => {
    if (!selectedReward) return

    if (profile.total_tokens < selectedReward.tokens_required) {
      setError("Insufficient tokens for this reward")
      return
    }

    setIsRedeeming(true)
    setError(null)

    try {
      await rewardsService.redeemReward(profile.id, selectedReward)

      setShowSuccess(true)
      setTimeout(() => {
        router.push("/dashboard/wallet")
      }, 2000)
    } catch (err: any) {
      console.error("[v0] Error redeeming reward:", err)
      setError(err.message || "Failed to redeem reward. Please try again.")
    } finally {
      setIsRedeeming(false)
    }
  }

  return (
    <DashboardLayout profile={profile}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Rewards Catalog</h1>
            <p className="text-muted-foreground">Redeem your tokens for rewards</p>
          </div>
          <Button variant="outline" onClick={() => router.push("/dashboard/wallet")}>
            <Coins className="mr-2 h-4 w-4" />
            {profile.total_tokens.toLocaleString()} Tokens
          </Button>
        </div>

        {/* Balance Card */}
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available Balance</p>
                <div className="flex items-center gap-2">
                  <Coins className="h-6 w-6 text-primary" />
                  <span className="text-3xl font-bold text-primary">{profile.total_tokens.toLocaleString()}</span>
                  <span className="text-sm text-muted-foreground">tokens</span>
                </div>
              </div>
              <Button onClick={() => router.push("/dashboard")} variant="outline">
                Earn More Tokens
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search rewards..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="voucher">Vouchers</SelectItem>
                  <SelectItem value="merchandise">Merchandise</SelectItem>
                  <SelectItem value="donation">Donations</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="certificate">Certificates</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Rewards Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            // Skeletons
            [1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="h-64"></CardContent>
              </Card>
            ))
          ) : filteredRewards.map((reward) => {
            const canAfford = profile.total_tokens >= reward.tokens_required
            return (
              <Card
                key={reward.id}
                className={`relative transition-all hover:shadow-lg ${!canAfford ? "opacity-60" : ""}`}
              >
                {/* Badge rendering if needed - not in schema yet currently */}
                {/* {reward.badge && (
                  <Badge className="absolute right-4 top-4 bg-accent" variant="secondary">
                    {reward.badge}
                  </Badge>
                )} */}
                <CardHeader>
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                    {getIcon(reward.icon_name)}
                  </div>
                  <CardTitle className="text-xl">{reward.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-sm text-muted-foreground">{reward.description}</p>
                  <Badge variant="outline" className="mb-4 capitalize">
                    {reward.category}
                  </Badge>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Coins className="h-5 w-5 text-primary" />
                      <span className="text-xl font-bold text-primary">{reward.tokens_required.toLocaleString()}</span>
                    </div>
                    <Button
                      onClick={() => setSelectedReward(reward)}
                      disabled={!canAfford}
                      className={canAfford ? "" : "cursor-not-allowed"}
                    >
                      {canAfford ? "Redeem" : "Insufficient Tokens"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredRewards.length === 0 && (
          <Card>
            <CardContent className="flex min-h-[200px] items-center justify-center p-6">
              <div className="text-center">
                <Gift className="mx-auto mb-2 h-12 w-12 text-muted-foreground" />
                <p className="text-lg font-semibold">No rewards found</p>
                <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Redemption Confirmation Dialog */}
      <Dialog open={!!selectedReward && !showSuccess} onOpenChange={() => setSelectedReward(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Redemption</DialogTitle>
            <DialogDescription>Are you sure you want to redeem this reward?</DialogDescription>
          </DialogHeader>
          {selectedReward && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  {selectedReward.icon_name && getIcon(selectedReward.icon_name)}
                </div>
                <div>
                  <p className="font-semibold">{selectedReward.title}</p>
                  <p className="text-sm text-muted-foreground">{selectedReward.description}</p>
                </div>
              </div>
              <div className="rounded-lg bg-muted p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Cost:</span>
                  <span className="flex items-center gap-1 font-bold text-primary">
                    <Coins className="h-4 w-4" />
                    {selectedReward.tokens_required.toLocaleString()} tokens
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Your Balance:</span>
                  <span className="font-bold">{profile.total_tokens.toLocaleString()} tokens</span>
                </div>
                <div className="mt-2 flex items-center justify-between border-t pt-2">
                  <span className="text-sm text-muted-foreground">After Redemption:</span>
                  <span className="font-bold text-green-600">
                    {(profile.total_tokens - selectedReward.tokens_required).toLocaleString()} tokens
                  </span>
                </div>
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedReward(null)} disabled={isRedeeming}>
              Cancel
            </Button>
            <Button onClick={handleRedeem} disabled={isRedeeming} className="bg-primary hover:bg-primary-hover">
              {isRedeeming ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Redeeming...
                </>
              ) : (
                "Confirm Redemption"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={() => setShowSuccess(false)}>
        <DialogContent>
          <DialogHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <DialogTitle className="text-center">Redemption Successful!</DialogTitle>
            <DialogDescription className="text-center">
              Your reward has been redeemed and will be processed shortly.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
