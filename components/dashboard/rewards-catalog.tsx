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

const SAMPLE_REWARDS = [
  {
    id: "voucher-100",
    type: "voucher",
    title: "100 Rupee Voucher",
    description: "Redeemable at partner stores",
    tokens: 500,
    icon: <ShoppingBag className="h-8 w-8" />,
    badge: "Popular",
  },
  {
    id: "voucher-250",
    type: "voucher",
    title: "250 Rupee Voucher",
    description: "Redeemable at partner stores",
    tokens: 1200,
    icon: <ShoppingBag className="h-8 w-8" />,
  },
  {
    id: "voucher-500",
    type: "voucher",
    title: "500 Rupee Voucher",
    description: "Redeemable at partner stores",
    tokens: 2300,
    icon: <ShoppingBag className="h-8 w-8" />,
    badge: "Best Value",
  },
  {
    id: "merchandise-tshirt",
    type: "merchandise",
    title: "SaafSaksham T-Shirt",
    description: "Official branded merchandise",
    tokens: 800,
    icon: <Gift className="h-8 w-8" />,
  },
  {
    id: "merchandise-bottle",
    type: "merchandise",
    title: "Eco Water Bottle",
    description: "Reusable stainless steel bottle",
    tokens: 600,
    icon: <Gift className="h-8 w-8" />,
  },
  {
    id: "donation-tree",
    type: "donation",
    title: "Plant a Tree",
    description: "Plant a tree in your city",
    tokens: 300,
    icon: <Heart className="h-8 w-8" />,
    badge: "Impact",
  },
  {
    id: "donation-meal",
    type: "donation",
    title: "Donate a Meal",
    description: "Provide a meal to someone in need",
    tokens: 200,
    icon: <Heart className="h-8 w-8" />,
    badge: "Impact",
  },
  {
    id: "cash-500",
    type: "cash",
    title: "500 Rupees Cash",
    description: "Direct bank transfer",
    tokens: 2500,
    icon: <DollarSign className="h-8 w-8" />,
  },
  {
    id: "certificate",
    type: "certificate",
    title: "Civic Champion Certificate",
    description: "Official recognition certificate",
    tokens: 1000,
    icon: <Award className="h-8 w-8" />,
  },
]

export default function RewardsCatalog({ profile, partners }: RewardsCatalogProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [selectedReward, setSelectedReward] = useState<any>(null)
  const [isRedeeming, setIsRedeeming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  const filteredRewards = SAMPLE_REWARDS.filter((reward) => {
    const matchesSearch = reward.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === "all" || reward.type === typeFilter
    return matchesSearch && matchesType
  })

  const handleRedeem = async () => {
    if (!selectedReward) return

    if (profile.total_tokens < selectedReward.tokens) {
      setError("Insufficient tokens for this reward")
      return
    }

    setIsRedeeming(true)
    setError(null)
    const supabase = createClient()

    try {
      // Deduct tokens
      const { error: tokenError } = await supabase.from("tokens").insert({
        user_id: profile.id,
        amount: -selectedReward.tokens,
        transaction_type: "redeemed",
        description: `Redeemed: ${selectedReward.title}`,
      })

      if (tokenError) throw tokenError

      // Create redemption record
      const { error: redemptionError } = await supabase.from("redemptions").insert({
        user_id: profile.id,
        partner_id: partners[0]?.id || null,
        tokens_spent: selectedReward.tokens,
        reward_type: selectedReward.type,
        reward_details: {
          title: selectedReward.title,
          description: selectedReward.description,
          reward_id: selectedReward.id,
        },
        status: "pending",
      })

      if (redemptionError) throw redemptionError

      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          total_tokens: profile.total_tokens - selectedReward.tokens,
        })
        .eq("id", profile.id)

      if (profileError) throw profileError

      // Create notification
      await supabase.from("notifications").insert({
        user_id: profile.id,
        type: "reward_redeemed",
        title: "Reward Redeemed!",
        message: `You've redeemed ${selectedReward.title} for ${selectedReward.tokens} tokens.`,
        link: "/dashboard/wallet",
      })

      setShowSuccess(true)
      setTimeout(() => {
        router.push("/dashboard/wallet")
      }, 2000)
    } catch (err) {
      console.error("[v0] Error redeeming reward:", err)
      setError("Failed to redeem reward. Please try again.")
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
          {filteredRewards.map((reward) => {
            const canAfford = profile.total_tokens >= reward.tokens
            return (
              <Card
                key={reward.id}
                className={`relative transition-all hover:shadow-lg ${!canAfford ? "opacity-60" : ""}`}
              >
                {reward.badge && (
                  <Badge className="absolute right-4 top-4 bg-accent" variant="secondary">
                    {reward.badge}
                  </Badge>
                )}
                <CardHeader>
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                    {reward.icon}
                  </div>
                  <CardTitle className="text-xl">{reward.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-sm text-muted-foreground">{reward.description}</p>
                  <Badge variant="outline" className="mb-4 capitalize">
                    {reward.type}
                  </Badge>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Coins className="h-5 w-5 text-primary" />
                      <span className="text-xl font-bold text-primary">{reward.tokens.toLocaleString()}</span>
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
                  {selectedReward.icon}
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
                    {selectedReward.tokens.toLocaleString()} tokens
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Your Balance:</span>
                  <span className="font-bold">{profile.total_tokens.toLocaleString()} tokens</span>
                </div>
                <div className="mt-2 flex items-center justify-between border-t pt-2">
                  <span className="text-sm text-muted-foreground">After Redemption:</span>
                  <span className="font-bold text-green-600">
                    {(profile.total_tokens - selectedReward.tokens).toLocaleString()} tokens
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
