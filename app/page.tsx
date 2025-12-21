import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  MapPin,
  Camera,
  Award,
  Users,
  TrendingUp,
  Shield,
  Sparkles,
  Target,
  Coins,
  CheckCircle2,
  ArrowRight,
  Star,
} from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">SaafSaksham</span>
          </div>
          <nav className="hidden items-center gap-6 md:flex">
            <Link href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              How It Works
            </Link>
            <Link href="#impact" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Impact
            </Link>
            <Link href="#rewards" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Rewards
            </Link>
            <Link href="/auth/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button className="bg-primary hover:bg-primary-hover">Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="gradient-hero relative overflow-hidden py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
              India's First Verified Civic Marketplace
            </Badge>
            <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight text-foreground md:text-6xl">
              Clean Your City,
              <br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Earn Real Rewards
              </span>
            </h1>
            <p className="mb-8 text-pretty text-lg text-muted-foreground md:text-xl">
              Join 50,000+ citizens transforming India's cities through verified micro-tasks. Complete cleanliness
              challenges, earn tokens, and redeem real rewards while making an impact.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/auth/sign-up">
                <Button size="lg" className="bg-primary text-white hover:bg-primary-hover">
                  Start Earning Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button size="lg" variant="outline">
                  Watch Demo
                </Button>
              </Link>
            </div>
            <div className="mt-12 grid grid-cols-2 gap-8 md:grid-cols-4">
              <div>
                <div className="text-3xl font-bold text-primary">50K+</div>
                <div className="text-sm text-muted-foreground">Active Users</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">2.5L+</div>
                <div className="text-sm text-muted-foreground">Tasks Completed</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">500+</div>
                <div className="text-sm text-muted-foreground">Cities Covered</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">95%</div>
                <div className="text-sm text-muted-foreground">Verified Tasks</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">How SaafSaksham Works</h2>
            <p className="text-lg text-muted-foreground">Four simple steps to make an impact</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">1. Discover Tasks</h3>
                <p className="text-muted-foreground">
                  Browse verified civic tasks near you. From cleaning garbage to fixing potholes - all geotagged and
                  verified.
                </p>
              </CardContent>
            </Card>
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Camera className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">2. Complete & Prove</h3>
                <p className="text-muted-foreground">
                  Take before/after photos with timestamp. AI verifies authenticity. Your proof becomes permanent
                  evidence.
                </p>
              </CardContent>
            </Card>
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">3. Get Verified</h3>
                <p className="text-muted-foreground">
                  Community verifiers + AI review your work. Quality checks ensure genuine impact and prevent fraud.
                </p>
              </CardContent>
            </Card>
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">4. Earn Rewards</h3>
                <p className="text-muted-foreground">
                  Collect tokens, badges, and XP. Redeem for vouchers, merchandise, or donate to social causes.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">Why Citizens Trust SaafSaksham</h2>
            <p className="text-lg text-muted-foreground">Verified impact, real rewards, transparent data</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="mb-2 font-semibold">AI + Human Verification</h3>
                <p className="text-sm text-muted-foreground">
                  Dual verification system prevents fraud and ensures every task has genuine impact.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="mb-2 font-semibold">Geotagged Proof</h3>
                <p className="text-sm text-muted-foreground">
                  Every task has GPS coordinates and timestamps. View impact on interactive maps.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Coins className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="mb-2 font-semibold">Real Rewards</h3>
                <p className="text-sm text-muted-foreground">
                  Earn tokens redeemable for Amazon, Flipkart, food delivery vouchers, and more.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="mb-2 font-semibold">Gamification & Streaks</h3>
                <p className="text-sm text-muted-foreground">
                  Earn badges, maintain streaks, climb leaderboards. Make civic duty addictive.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="mb-2 font-semibold">Community Driven</h3>
                <p className="text-sm text-muted-foreground">
                  Join 50,000+ verified citizens. Report issues, complete tasks, verify others.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Star className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="mb-2 font-semibold">CSR Partnerships</h3>
                <p className="text-sm text-muted-foreground">
                  Top brands sponsor high-impact tasks. Earn more from premium challenges.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section id="impact" className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">Your Impact, Measured & Verified</h2>
            <p className="mb-12 text-lg text-muted-foreground">
              Every task you complete is tracked, verified, and visualized on our transparency dashboard
            </p>
            <div className="rounded-lg border-2 border-primary/20 bg-muted/50 p-8">
              <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                <div>
                  <div className="mb-2 text-4xl font-bold text-primary">15,000</div>
                  <div className="text-sm text-muted-foreground">Tons Waste Removed</div>
                </div>
                <div>
                  <div className="mb-2 text-4xl font-bold text-primary">3,200</div>
                  <div className="text-sm text-muted-foreground">Potholes Fixed</div>
                </div>
                <div>
                  <div className="mb-2 text-4xl font-bold text-primary">8,500</div>
                  <div className="text-sm text-muted-foreground">Drains Cleaned</div>
                </div>
                <div>
                  <div className="mb-2 text-4xl font-bold text-primary">12M</div>
                  <div className="text-sm text-muted-foreground">Lives Impacted</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rewards Section */}
      <section id="rewards" className="bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">Earn Real Rewards</h2>
            <p className="text-lg text-muted-foreground">Redeem your tokens for vouchers, merchandise, and more</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="mb-4 aspect-square rounded-lg bg-gradient-to-br from-orange-100 to-orange-200 p-4">
                  <div className="flex h-full items-center justify-center text-4xl">🎁</div>
                </div>
                <h3 className="mb-2 font-semibold">Amazon Vouchers</h3>
                <p className="text-sm text-muted-foreground">From 1,000 tokens</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="mb-4 aspect-square rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 p-4">
                  <div className="flex h-full items-center justify-center text-4xl">🍕</div>
                </div>
                <h3 className="mb-2 font-semibold">Food Delivery</h3>
                <p className="text-sm text-muted-foreground">Zomato, Swiggy</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="mb-4 aspect-square rounded-lg bg-gradient-to-br from-green-100 to-green-200 p-4">
                  <div className="flex h-full items-center justify-center text-4xl">👕</div>
                </div>
                <h3 className="mb-2 font-semibold">Merchandise</h3>
                <p className="text-sm text-muted-foreground">Exclusive T-shirts</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="mb-4 aspect-square rounded-lg bg-gradient-to-br from-emerald-100 to-emerald-200 p-4">
                  <div className="flex h-full items-center justify-center text-4xl">🌳</div>
                </div>
                <h3 className="mb-2 font-semibold">Donate Impact</h3>
                <p className="text-sm text-muted-foreground">Plant trees, clean water</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl rounded-2xl bg-gradient-to-r from-primary to-accent p-8 text-center text-white md:p-12">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Ready to Make an Impact?</h2>
            <p className="mb-8 text-lg opacity-90">
              Join thousands of citizens earning rewards while transforming their communities
            </p>
            <Link href="/auth/sign-up">
              <Button size="lg" variant="secondary" className="text-primary">
                Sign Up Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/50 py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-foreground">SaafSaksham</span>
              </div>
              <p className="text-sm text-muted-foreground">
                India's first verified civic-cleanliness micro-task marketplace
              </p>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-foreground">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Rewards
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Leaderboard
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-foreground">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-foreground">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
            © 2025 SaafSaksham. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
