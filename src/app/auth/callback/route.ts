import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/dashboard'

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            const isLocalEnv = process.env.NODE_ENV === 'development'
            const productionUrl = 'https://www.proinvoice.cloud'

            if (isLocalEnv) {
                return NextResponse.redirect(`${origin}${next}`)
            } else {
                return NextResponse.redirect(`${productionUrl}${next}`)
            }
        }
    }

    // Return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/login?error=Could not authenticate with Google`)
}
