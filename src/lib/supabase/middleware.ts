import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    // Check for required environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
        console.error('Missing Supabase environment variables')
        return NextResponse.next({ request })
    }

    let supabaseResponse = NextResponse.next({
        request,
    })

    try {
        const supabase = createServerClient(
            supabaseUrl,
            supabaseAnonKey,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll()
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                        supabaseResponse = NextResponse.next({
                            request,
                        })
                        cookiesToSet.forEach(({ name, value, options }) =>
                            supabaseResponse.cookies.set(name, value, options)
                        )
                    },
                },
            }
        )

        // Refresh session if expired - wrap in try-catch for edge runtime safety
        let user = null
        try {
            const { data } = await supabase.auth.getUser()
            user = data?.user
        } catch (authError) {
            console.error('Error getting user in proxy:', authError)
            // Continue without user - will be treated as unauthenticated
        }

        // Protected routes - redirect to login if not authenticated
        const protectedPaths = ['/dashboard', '/invoices', '/customers', '/receivables']
        const isProtectedPath = protectedPaths.some(path =>
            request.nextUrl.pathname.startsWith(path)
        )

        if (isProtectedPath && !user) {
            const url = request.nextUrl.clone()
            url.pathname = '/login'
            return NextResponse.redirect(url)
        }

        // Redirect logged-in users away from auth pages
        const authPaths = ['/login', '/signup']
        const isAuthPath = authPaths.some(path =>
            request.nextUrl.pathname === path
        )

        if (isAuthPath && user) {
            const url = request.nextUrl.clone()
            url.pathname = '/dashboard'
            return NextResponse.redirect(url)
        }

        return supabaseResponse
    } catch (error) {
        console.error('Error in updateSession:', error)
        // Return a basic response to prevent 500 errors
        return NextResponse.next({ request })
    }
}

