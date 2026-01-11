import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSubscription } from '@/lib/razorpay'
import { getUserSubscription } from '@/lib/subscription'

// Get plan IDs from environment
const PLAN_IDS = {
    monthly: process.env.RAZORPAY_PLAN_ID_MONTHLY || process.env.RAZORPAY_PLAN_ID || '',
    yearly: process.env.RAZORPAY_PLAN_ID_YEARLY || '',
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json().catch(() => ({}))
        const billingCycle = body.billingCycle || 'monthly'

        // Get the correct plan ID based on billing cycle
        const planId = billingCycle === 'yearly' ? PLAN_IDS.yearly : PLAN_IDS.monthly

        // Validate Plan ID is configured
        if (!planId || planId === '' || !planId.startsWith('plan_')) {
            console.error('Invalid plan ID for', billingCycle, ':', planId)
            return NextResponse.json(
                { error: `${billingCycle === 'yearly' ? 'Yearly' : 'Monthly'} plan not configured. Please contact support.` },
                { status: 500 }
            )
        }

        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check if user already has pro subscription
        const existingSubscription = await getUserSubscription(user.id)
        if (existingSubscription?.plan === 'pro' && existingSubscription?.status === 'active') {
            return NextResponse.json(
                { error: 'You already have an active Pro subscription' },
                { status: 400 }
            )
        }

        console.log('Creating subscription with Plan ID:', planId, 'Billing:', billingCycle)

        // Create Razorpay subscription
        const subscription = await createSubscription({
            planId: planId,
            notes: {
                userId: user.id,
                email: user.email || '',
                billingCycle: billingCycle,
            },
        })

        console.log('Subscription created:', subscription.id)

        return NextResponse.json({
            subscriptionId: subscription.id,
            keyId: process.env.RAZORPAY_KEY_ID,
        })
    } catch (error: unknown) {
        console.error('Razorpay subscription error:', error)

        // Extract Razorpay error details
        const razorpayError = error as { error?: { description?: string } }
        const errorMessage = razorpayError?.error?.description || 'Failed to create subscription'

        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        )
    }
}
