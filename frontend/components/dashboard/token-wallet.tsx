"use client"

import type { Profile, TokenTransaction, Redemption } from "@/lib/types/database"
import { useState } from "react"
import DashboardLayout from "@/components/dashboard/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Coins, TrendingUp, ArrowUpRight, ArrowDownLeft, Gift, Calendar, ExternalLink } from "lucide-react"
import { useRouter } from "next/navigation"

interface TokenWalletProps {
  profile: Profile
  transactions: TokenTransaction[]
  redemptions: Redemption[]
}

export default function TokenWallet({ profile, transactions, redemptions }: TokenWalletProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("transactions")

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "earned":
        return <ArrowUpRight className="h-4 w-4 text-green-500" />
      case "redeemed":
        return <ArrowDownLeft className="h-4 w-4 text-red-500" />
      case "bonus":
        return <Gift className="h-4 w-4 text-primary" />
      default:
        return <Coins className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>
      case "fulfilled":
        return <Badge className="bg-green-500">Fulfilled</Badge>
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <DashboardLayout profile={profile}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Token Wallet</h1>
            <p className="text-muted-foreground">Manage your tokens and redeem rewards</p>
          </div>
          <Button onClick={() => router.push("/dashboard/rewards")} className="bg-primary hover:bg-primary-hover">
            <Gift className="mr-2 h-4 w-4" />
            Browse Rewards
          </Button>
        </div>

        {/* Balance Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Token Balance</CardTitle>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{profile.total_tokens.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Available for redemption</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total XP</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">{profile.total_xp.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Experience points earned</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lifetime Earnings</CardTitle>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {transactions
                  .filter((t) => t.transaction_type === "earned" || t.transaction_type === "bonus")
                  .reduce((sum, t) => sum + t.amount, 0)
                  .toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Total tokens earned</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="redemptions">Redemptions</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <div className="flex min-h-[200px] items-center justify-center">
                    <div className="text-center">
                      <Coins className="mx-auto mb-2 h-12 w-12 text-muted-foreground" />
                      <p className="text-lg font-semibold">No transactions yet</p>
                      <p className="text-sm text-muted-foreground">Complete tasks to earn tokens</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          {getTransactionIcon(transaction.transaction_type)}
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(transaction.created_at)}</span>
                              <Badge variant="outline" className="capitalize">
                                {transaction.transaction_type}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div
                          className={`text-lg font-bold ${transaction.transaction_type === "redeemed" ? "text-red-500" : "text-green-500"
                            }`}
                        >
                          {transaction.transaction_type === "redeemed" ? "-" : "+"}
                          {transaction.amount.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="redemptions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Redemption History</CardTitle>
              </CardHeader>
              <CardContent>
                {redemptions.length === 0 ? (
                  <div className="flex min-h-[200px] items-center justify-center">
                    <div className="text-center">
                      <Gift className="mx-auto mb-2 h-12 w-12 text-muted-foreground" />
                      <p className="text-lg font-semibold">No redemptions yet</p>
                      <p className="text-sm text-muted-foreground">Browse rewards catalog to redeem your tokens</p>
                      <Button onClick={() => router.push("/dashboard/rewards")} className="mt-4" variant="outline">
                        View Rewards
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {redemptions.map((redemption) => (
                      <div
                        key={redemption.id}
                        className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                      >
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-2">
                            <p className="font-medium capitalize">{redemption.reward_type.replace("_", " ")}</p>
                            {getStatusBadge(redemption.status)}
                          </div>
                          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                            {redemption.csr_partners && (
                              <span className="flex items-center gap-1">
                                <ExternalLink className="h-3 w-3" />
                                {redemption.csr_partners.name}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(redemption.created_at)}
                            </span>
                            {redemption.fulfilled_at && (
                              <span className="text-green-600">Fulfilled on {formatDate(redemption.fulfilled_at)}</span>
                            )}
                          </div>
                          {redemption.reward_details && (
                            <p className="mt-2 text-sm text-muted-foreground">
                              {redemption.reward_details.description || redemption.reward_details.title}
                            </p>
                          )}
                        </div>
                        <div className="ml-4 text-right">
                          <div className="text-lg font-bold text-red-500">
                            -{redemption.tokens_spent.toLocaleString()}
                          </div>
                          <span className="text-xs text-muted-foreground">tokens</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
