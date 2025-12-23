import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    // Create Supabase client
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    response = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
                },
            },
        }
    )

    // Get user
    const {
        data: { user },
    } = await supabase.auth.getUser()

    // 1. If user is signed in and visits landing page, redirect to dashboard
    if (user && request.nextUrl.pathname === "/") {
        return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    // 2. If user is signed in and visits auth pages, redirect to dashboard
    if (user && (request.nextUrl.pathname.startsWith("/auth/login") || request.nextUrl.pathname.startsWith("/auth/sign-up"))) {
        return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    // 3. If user is NOT signed in and visits dashboard, redirect to login
    if (!user && request.nextUrl.pathname.startsWith("/dashboard")) {
        return NextResponse.redirect(new URL("/auth/login", request.url))
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
}
