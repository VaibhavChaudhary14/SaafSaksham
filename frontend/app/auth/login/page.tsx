"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FadeIn } from '@/components/ui/motion-primitives';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-grid bg-neo-white font-sans text-neo-black">
      <FadeIn>
        <div className="w-full max-w-md space-y-8 bg-white p-8 border-2 border-black shadow-neo">
          <div className="text-center">
            <h2 className="mt-6 text-4xl font-black tracking-tight font-sirukota">SIGN IN</h2>
            <p className="mt-2 text-sm font-bold font-story">
              Or{' '}
              <Link href="/auth/signup" className="font-medium text-blue-600 underline decoration-2 underline-offset-4 hover:text-blue-800">
                create a new account
              </Link>
            </p>
          </div>

          <div className="mt-8 space-y-6">
            <div className="space-y-4">
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2 font-bold border-2 border-black shadow-neo active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Sign in with Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t-2 border-black/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-black font-bold font-mono">Or continue with</span>
                </div>
              </div>

              {error && (
                <Alert variant="destructive" className="border-2 border-black shadow-neo">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle className="font-bold">Error</AlertTitle>
                  <AlertDescription className="font-mono text-xs">{error}</AlertDescription>
                </Alert>
              )}

              <form className="space-y-4" onSubmit={handleLogin}>
                <div>
                  <Label htmlFor="email" className="font-bold font-story">Email address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 border-2 border-black shadow-sm focus-visible:ring-0 focus-visible:shadow-neo transition-shadow bg-neo-white"
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="password" className="font-bold font-story">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 border-2 border-black shadow-sm focus-visible:ring-0 focus-visible:shadow-neo transition-shadow bg-neo-white"
                    disabled={loading}
                  />
                </div>

                <Button type="submit" className="w-full font-bold text-lg shadow-neo active:shadow-none active:translate-x-[2px] active:translate-y-[2px]" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign in
                </Button>
              </form>
            </div>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
