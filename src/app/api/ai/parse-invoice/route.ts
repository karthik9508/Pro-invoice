import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { parseInvoicePrompt } from '@/lib/gemini'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { prompt } = await request.json()

        if (!prompt || typeof prompt !== 'string') {
            return NextResponse.json(
                { error: 'Prompt is required' },
                { status: 400 }
            )
        }

        const parsedInvoice = await parseInvoicePrompt(prompt)

        return NextResponse.json(parsedInvoice)
    } catch (error: unknown) {
        console.error('Failed to parse invoice:', error)

        // Handle rate limit errors
        const errorMessage = error instanceof Error ? error.message : String(error)

        // Handle quota exhausted
        if (errorMessage === 'QUOTA_EXHAUSTED') {
            return NextResponse.json(
                { error: 'Daily AI quota exhausted. Please try again tomorrow or use manual entry below.' },
                { status: 429 }
            )
        }

        if (errorMessage.includes('429') || errorMessage.includes('Too Many Requests') || errorMessage.includes('quota')) {
            return NextResponse.json(
                { error: 'AI service is temporarily busy. Please wait 30 seconds and try again.' },
                { status: 429 }
            )
        }

        return NextResponse.json(
            { error: 'Failed to parse invoice prompt. Please try again.' },
            { status: 500 }
        )
    }
}
