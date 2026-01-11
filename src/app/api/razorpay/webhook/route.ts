import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature } from '@/lib/razorpay'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
    const body = await request.text()
    const signature = request.headers.get('x-razorpay-signature')

    if (!signature) {
        return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    // Verify webhook signature
    const isValid = verifyWebhookSignature(body, signature)
    if (!isValid) {
        console.error('Webhook signature verification failed')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    try {
        const event = JSON.parse(body)
        const eventType = event.event

        switch (eventType) {
            case 'subscription.activated': {
                const subscription = event.payload.subscription.entity
                const subscriptionId = subscription.id
                const notes = subscription.notes || {}
                const userId = notes.userId

                if (userId) {
                    const { data: existing } = await supabaseAdmin
                        .from('subscriptions')
                        .select('id')
                        .eq('user_id', userId)
                        .single()

                    if (existing) {
                        await supabaseAdmin
                            .from('subscriptions')
                            .update({
                                razorpay_subscription_id: subscriptionId,
                                plan: 'pro',
                                status: 'active',
                                updated_at: new Date().toISOString(),
                            })
                            .eq('user_id', userId)
                    } else {
                        await supabaseAdmin
                            .from('subscriptions')
                            .insert({
                                user_id: userId,
                                razorpay_subscription_id: subscriptionId,
                                plan: 'pro',
                                status: 'active',
                            })
                    }
                }
                break
            }

            case 'subscription.cancelled':
            case 'subscription.expired': {
                const subscription = event.payload.subscription.entity
                const subscriptionId = subscription.id

                await supabaseAdmin
                    .from('subscriptions')
                    .update({
                        plan: 'free',
                        status: 'canceled',
                        updated_at: new Date().toISOString(),
                    })
                    .eq('razorpay_subscription_id', subscriptionId)
                break
            }

            case 'subscription.paused': {
                const subscription = event.payload.subscription.entity
                const subscriptionId = subscription.id

                await supabaseAdmin
                    .from('subscriptions')
                    .update({
                        status: 'past_due',
                        updated_at: new Date().toISOString(),
                    })
                    .eq('razorpay_subscription_id', subscriptionId)
                break
            }

            case 'subscription.resumed': {
                const subscription = event.payload.subscription.entity
                const subscriptionId = subscription.id

                await supabaseAdmin
                    .from('subscriptions')
                    .update({
                        status: 'active',
                        updated_at: new Date().toISOString(),
                    })
                    .eq('razorpay_subscription_id', subscriptionId)
                break
            }
        }

        return NextResponse.json({ received: true })
    } catch (error) {
        console.error('Webhook handler error:', error)
        return NextResponse.json(
            { error: 'Webhook handler failed' },
            { status: 500 }
        )
    }
}
