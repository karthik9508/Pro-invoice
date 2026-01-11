import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyPaymentSignature } from '@/lib/razorpay'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const {
            razorpay_payment_id,
            razorpay_subscription_id,
            razorpay_signature,
        } = body

        // Verify signature
        const isValid = verifyPaymentSignature(
            razorpay_payment_id,
            razorpay_subscription_id,
            razorpay_signature
        )

        if (!isValid) {
            return NextResponse.json(
                { error: 'Invalid payment signature' },
                { status: 400 }
            )
        }

        // Update subscription in database
        const { data: existingSubscription } = await supabase
            .from('subscriptions')
            .select('id')
            .eq('user_id', user.id)
            .single()

        if (existingSubscription) {
            await supabase
                .from('subscriptions')
                .update({
                    razorpay_subscription_id: razorpay_subscription_id,
                    plan: 'pro',
                    status: 'active',
                    updated_at: new Date().toISOString(),
                })
                .eq('user_id', user.id)
        } else {
            await supabase
                .from('subscriptions')
                .insert({
                    user_id: user.id,
                    razorpay_subscription_id: razorpay_subscription_id,
                    plan: 'pro',
                    status: 'active',
                })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Payment verification error:', error)
        return NextResponse.json(
            { error: 'Failed to verify payment' },
            { status: 500 }
        )
    }
}
