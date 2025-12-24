"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, signInWithPopup, updateProfile } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { PublicRoute } from "@/components/auth/route-guards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Mail, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

export default function SignupPage() {
    return (
        <PublicRoute>
            <SignupForm />
        </PublicRoute>
    );
}

function SignupForm() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const passwordStrength = calculatePasswordStrength(password);

    const handleEmailSignup = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !email || !password) {
            setError("Please fill in all fields");
            return;
        }

        if (passwordStrength < 50) {
            setError("Please choose a stronger password");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            // Update display name
            await updateProfile(userCredential.user, {
                displayName: name,
            });

            toast.success("Account created successfully!");

            // Router will handle redirect via PublicRoute
        } catch (err: any) {
            console.error("[Signup] Error:", err);

            const errorMessage = getFirebaseErrorMessage(err.code);
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignup = async () => {
        setGoogleLoading(true);
        setError(null);

        try {
            await signInWithPopup(auth, googleProvider);

            toast.success("Account created with Google!");

            // Router will handle redirect via PublicRoute
        } catch (err: any) {
            console.error("[Google Signup] Error:", err);

            if (err.code === "auth/popup-closed-by-user") {
                return;
            }

            const errorMessage = getFirebaseErrorMessage(err.code);
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setGoogleLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
            <div className="w-full max-w-md">
                {/* Logo & Brand */}
                <div className="mb-8 flex flex-col items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary shadow-lg">
                        <Sparkles className="h-7 w-7 text-white" />
                    </div>
                    <div className="text-center">
                        <h1 className="text-2xl font-bold tracking-tight">SaafSaksham</h1>
                        <p className="text-sm text-muted-foreground">Join 50,000+ civic champions</p>
                    </div>
                </div>

                <Card className="border-2 shadow-xl">
                    <CardHeader className="space-y-1 pb-4">
                        <CardTitle className="text-2xl font-bold tracking-tight">Create your account</CardTitle>
                        <CardDescription className="text-base">Start earning rewards for making an impact</CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {/* Error Alert */}
                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {/* Google Sign Up */}
                        <Button type="button" variant="outline" className="w-full h-11" onClick={handleGoogleSignup} disabled={loading || googleLoading}>
                            {googleLoading ? (
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            ) : (
                                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                                    <path
                                        fill="currentColor"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                            )}
                            Continue with Google
                        </Button>

                        {/* Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-2 text-muted-foreground">Or sign up with email</span>
                            </div>
                        </div>

                        {/* Email Signup Form */}
                        <form onSubmit={handleEmailSignup} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    disabled={loading || googleLoading}
                                    className="h-11"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={loading || googleLoading}
                                        className="pl-10 h-11"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Create a strong password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={loading || googleLoading}
                                        className="pr-10 h-11"
                                        required
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                                        disabled={loading || googleLoading}
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>

                                {/* Password Strength Indicator */}
                                {password && (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-muted-foreground">Password strength</span>
                                            <span className={`font-medium ${getStrengthColor(passwordStrength)}`}>{getStrengthLabel(passwordStrength)}</span>
                                        </div>
                                        <Progress value={passwordStrength} className="h-1" />

                                        <div className="space-y-1">
                                            <PasswordRequirement met={password.length >= 8} text="At least 8 characters" />
                                            <PasswordRequirement met={/[A-Z]/.test(password)} text="One uppercase letter" />
                                            <PasswordRequirement met={/[0-9]/.test(password)} text="One number" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90" disabled={loading || googleLoading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Creating account...
                                    </>
                                ) : (
                                    "Create account"
                                )}
                            </Button>
                        </form>

                        {/* Sign In Link */}
                        <div className="text-center text-sm">
                            <span className="text-muted-foreground">Already have an account? </span>
                            <Link href="/auth/login" className="font-medium text-primary hover:underline">
                                Sign in
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* Footer */}
                <p className="mt-6 text-center text-xs text-muted-foreground">
                    By creating an account, you agree to our{" "}
                    <Link href="/terms" className="underline hover:text-foreground">
                        Terms
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="underline hover:text-foreground">
                        Privacy Policy
                    </Link>
                </p>
            </div>
        </div>
    );
}

function PasswordRequirement({ met, text }: { met: boolean; text: string }) {
    return (
        <div className="flex items-center gap-2 text-xs">
            {met ? <CheckCircle2 className="h-3.5 w-3.5 text-green-600" /> : <XCircle className="h-3.5 w-3.5 text-muted-foreground" />}
            <span className={met ? "text-foreground" : "text-muted-foreground"}>{text}</span>
        </div>
    );
}

function calculatePasswordStrength(password: string): number {
    if (!password) return 0;

    let strength = 0;

    // Length
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 15;

    // Character variety
    if (/[a-z]/.test(password)) strength += 15;
    if (/[A-Z]/.test(password)) strength += 15;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 15;

    return Math.min(strength, 100);
}

function getStrengthLabel(strength: number): string {
    if (strength < 30) return "Weak";
    if (strength < 60) return "Fair";
    if (strength < 80) return "Good";
    return "Strong";
}

function getStrengthColor(strength: number): string {
    if (strength < 30) return "text-red-600";
    if (strength < 60) return "text-orange-600";
    if (strength < 80) return "text-yellow-600";
    return "text-green-600";
}

function getFirebaseErrorMessage(code: string): string {
    switch (code) {
        case "auth/email-already-in-use":
            return "This email is already registered. Try logging in instead";
        case "auth/invalid-email":
            return "Invalid email address";
        case "auth/weak-password":
            return "Password is too weak. Please choose a stronger password";
        case "auth/operation-not-allowed":
            return "Email/password sign up is not enabled";
        case "auth/too-many-requests":
            return "Too many attempts. Please try again later";
        case "auth/network-request-failed":
            return "Network error. Please check your connection";
        case "auth/popup-blocked":
            return "Popup was blocked. Please allow popups and try again";
        default:
            return "An error occurred. Please try again";
    }
}
