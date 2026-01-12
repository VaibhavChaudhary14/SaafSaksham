import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, MapPin, Shield, Trophy } from 'lucide-react';
import { FadeIn, NeoCard, MagneticButton } from '@/components/ui/motion-primitives';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-neo-white font-sans text-neo-black">
      {/* Hero Section */}
      <section className="relative w-full py-20 md:py-32 lg:py-48 flex items-center justify-center overflow-hidden bg-grid border-b-4 border-black">
        <div className="container px-4 md:px-6 mx-auto relative z-10">
          <div className="flex flex-col items-center space-y-8 text-center">
            <FadeIn delay={0.1}>
              <div className="font-milestone inline-flex items-center border-2 border-black bg-neo-lemon px-3 py-1 text-sm font-bold shadow-neo transform -rotate-2">
                v1.0 Beta Live 🚀
              </div>
            </FadeIn>

            <FadeIn delay={0.2} className="space-y-4 max-w-4xl">
              <h1 className="font-sirukota text-5xl font-black tracking-tight sm:text-7xl md:text-8xl text-neo-black drop-shadow-sm">
                TRANSFORM YOUR <br />
                <span className="text-neo-pink px-2 decoration-clone underline decoration-4 underline-offset-4 decoration-black">CITY</span>
              </h1>
              <p className="font-story mx-auto max-w-[800px] text-lg md:text-xl lg:text-2xl font-medium border-l-4 border-black pl-4 bg-neo-white/50 backdrop-blur-sm p-4 neo-shadow">
                Join India's verified civic-cleanliness marketplace. Report issues, verify fixes, and earn real rewards.
              </p>
            </FadeIn>

            <FadeIn delay={0.4} className="flex flex-col sm:flex-row gap-4 w-full justify-center">
              <Link href="/auth/signup">
                <MagneticButton className="w-full sm:w-auto">
                  <Button size="xl" className="font-milestone w-full h-16 text-xl bg-neo-black text-neo-white hover:bg-neutral-800 border-2 border-black shadow-neo active:translate-x-[2px] active:translate-y-[2px] active:shadow-none rounded-none">
                    GET STARTED <ArrowRight className="ml-2 h-6 w-6" />
                  </Button>
                </MagneticButton>
              </Link>
              <Link href="/auth/login">
                <MagneticButton className="w-full sm:w-auto">
                  <Button variant="outline" size="xl" className="font-milestone w-full h-16 text-xl bg-neo-white text-neo-black border-2 border-black shadow-neo hover:bg-neutral-100 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none rounded-none">
                    SIGN IN
                  </Button>
                </MagneticButton>
              </Link>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-20 bg-neo-white">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-sirukota text-4xl font-black tracking-tight md:text-6xl mb-4 decoration-wavy underline decoration-neo-pink underline-offset-8">HOW IT WORKS</h2>
            <p className="font-story text-xl font-bold">Three simple steps to make a massive impact.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FadeIn delay={0.2} direction="left">
              <NeoCard className="h-full bg-neo-mint rounded-none">
                <div className="flex flex-col items-center text-center space-y-4 p-8">
                  <div className="p-4 bg-white border-2 border-black shadow-neo rounded-full">
                    <MapPin className="h-10 w-10 text-black" />
                  </div>
                  <h3 className="font-milestone text-2xl font-black">1. SPOT & REPORT</h3>
                  <p className="font-story font-medium leading-relaxed">
                    See garbage or potholes? Snap a photo with GPS location. Our AI verifies it instantly.
                  </p>
                </div>
              </NeoCard>
            </FadeIn>

            <FadeIn delay={0.4} direction="up">
              <NeoCard className="h-full bg-neo-blue rounded-none">
                <div className="flex flex-col items-center text-center space-y-4 p-8">
                  <div className="p-4 bg-white border-2 border-black shadow-neo rounded-full">
                    <Shield className="h-10 w-10 text-black" />
                  </div>
                  <h3 className="font-milestone text-2xl font-black">2. VERIFY & VALIDATE</h3>
                  <p className="font-story font-medium leading-relaxed">
                    Community members and AI validate reports to ensure authenticity using Consensus Protocol.
                  </p>
                </div>
              </NeoCard>
            </FadeIn>

            <FadeIn delay={0.6} direction="right">
              <NeoCard className="h-full bg-neo-pink rounded-none">
                <div className="flex flex-col items-center text-center space-y-4 p-8">
                  <div className="p-4 bg-white border-2 border-black shadow-neo rounded-full">
                    <Trophy className="h-10 w-10 text-black" />
                  </div>
                  <h3 className="font-milestone text-2xl font-black">3. EARN REWARDS</h3>
                  <p className="font-story font-medium leading-relaxed">
                    Earn XP and tokens for every verified task. Redeem them for real-world benefits.
                  </p>
                </div>
              </NeoCard>
            </FadeIn>
          </div>
        </div>
      </section>
    </div>
  );
}
