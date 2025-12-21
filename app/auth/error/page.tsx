import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Sparkles } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>
}) {
  const params = await searchParams

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">SaafSaksham</h1>
        </div>
        <Card>
          <CardHeader>
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
                <AlertCircle className="h-10 w-10 text-red-500" />
              </div>
            </div>
            <CardTitle className="text-center text-2xl">Authentication Error</CardTitle>
          </CardHeader>
          <CardContent>
            {params?.error ? (
              <p className="mb-6 text-center text-sm text-muted-foreground">Error code: {params.error}</p>
            ) : (
              <p className="mb-6 text-center text-sm text-muted-foreground">An unspecified error occurred.</p>
            )}
            <Link href="/auth/login">
              <Button className="w-full bg-primary hover:bg-primary-hover">Try Again</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
