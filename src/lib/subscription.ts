import { createClient } from '@/lib/supabase/server'
import type { Subscription, SubscriptionWithUsage } from '@/types'

const FREE_DAILY_LIMIT = 5

export async function getUserSubscription(userId: string): Promise<Subscription | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single()

    if (error || !data) {
        return null
    }

    return data as Subscription
}

export async function getInvoiceCountToday(userId: string): Promise<number> {
    const supabase = await createClient()

    // Get today's date in ISO format for comparison
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayISO = today.toISOString()

    const { count, error } = await supabase
        .from('invoices')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', todayISO)

    if (error) {
        console.error('Error counting invoices:', error)
        return 0
    }

    return count || 0
}

export async function checkInvoiceLimit(userId: string): Promise<{
    canCreate: boolean
    invoicesToday: number
    limit: number
    isPro: boolean
}> {
    const subscription = await getUserSubscription(userId)
    const isPro = subscription?.plan === 'pro' && subscription?.status === 'active'

    if (isPro) {
        return {
            canCreate: true,
            invoicesToday: 0,
            limit: Infinity,
            isPro: true,
        }
    }

    const invoicesToday = await getInvoiceCountToday(userId)

    return {
        canCreate: invoicesToday < FREE_DAILY_LIMIT,
        invoicesToday,
        limit: FREE_DAILY_LIMIT,
        isPro: false,
    }
}

export async function getSubscriptionWithUsage(userId: string): Promise<SubscriptionWithUsage> {
    const subscription = await getUserSubscription(userId)
    const invoicesToday = await getInvoiceCountToday(userId)
    const isPro = subscription?.plan === 'pro' && subscription?.status === 'active'

    return {
        id: subscription?.id || '',
        user_id: userId,
        razorpay_customer_id: subscription?.razorpay_customer_id,
        razorpay_subscription_id: subscription?.razorpay_subscription_id,
        plan: subscription?.plan || 'free',
        status: subscription?.status || 'active',
        current_period_end: subscription?.current_period_end,
        created_at: subscription?.created_at || new Date().toISOString(),
        updated_at: subscription?.updated_at || new Date().toISOString(),
        invoices_today: invoicesToday,
        can_create_invoice: isPro || invoicesToday < FREE_DAILY_LIMIT,
    }
}

export async function createOrUpdateSubscription(
    userId: string,
    data: Partial<Subscription>
): Promise<Subscription | null> {
    const supabase = await createClient()

    const existing = await getUserSubscription(userId)

    if (existing) {
        const { data: updated, error } = await supabase
            .from('subscriptions')
            .update({
                ...data,
                updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId)
            .select()
            .single()

        if (error) {
            console.error('Error updating subscription:', error)
            return null
        }

        return updated as Subscription
    } else {
        const { data: created, error } = await supabase
            .from('subscriptions')
            .insert({
                user_id: userId,
                plan: 'free',
                status: 'active',
                ...data,
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating subscription:', error)
            return null
        }

        return created as Subscription
    }
}
