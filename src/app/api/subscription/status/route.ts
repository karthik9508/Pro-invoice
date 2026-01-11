import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkInvoiceLimit } from '@/lib/subscription'

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const limitStatus = await checkInvoiceLimit(user.id)

        return NextResponse.json(limitStatus)
    } catch (error) {
        console.error('Subscription status error:', error)
        return NextResponse.json(
            { error: 'Failed to get subscription status' },
            { status: 500 }
        )
    }
}
