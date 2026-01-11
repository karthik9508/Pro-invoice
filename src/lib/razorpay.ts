import Razorpay from 'razorpay'
import crypto from 'crypto'

let razorpayInstance: Razorpay | null = null

export function getRazorpay(): Razorpay {
    if (!razorpayInstance) {
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            throw new Error('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are required')
        }
        razorpayInstance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        })
    }
    return razorpayInstance
}

export const RAZORPAY_PLAN_ID = process.env.RAZORPAY_PLAN_ID || ''

export interface RazorpaySubscriptionOptions {
    planId: string
    customerId?: string
    totalCount?: number
    notes?: Record<string, string>
}

export async function createSubscription(options: RazorpaySubscriptionOptions) {
    const razorpay = getRazorpay()

    const subscription = await razorpay.subscriptions.create({
        plan_id: options.planId,
        customer_notify: 1,
        total_count: options.totalCount || 12, // 12 billing cycles
        notes: options.notes || {},
    })

    return subscription
}

export async function cancelSubscription(subscriptionId: string) {
    const razorpay = getRazorpay()

    const subscription = await razorpay.subscriptions.cancel(subscriptionId)
    return subscription
}

export async function getSubscription(subscriptionId: string) {
    const razorpay = getRazorpay()

    const subscription = await razorpay.subscriptions.fetch(subscriptionId)
    return subscription
}

export function verifyPaymentSignature(
    razorpayPaymentId: string,
    razorpaySubscriptionId: string,
    razorpaySignature: string
): boolean {
    const secret = process.env.RAZORPAY_KEY_SECRET
    if (!secret) {
        throw new Error('RAZORPAY_KEY_SECRET is required')
    }

    const payload = razorpayPaymentId + '|' + razorpaySubscriptionId
    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex')

    return expectedSignature === razorpaySignature
}

export function verifyWebhookSignature(
    body: string,
    signature: string
): boolean {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET
    if (!secret) {
        throw new Error('RAZORPAY_WEBHOOK_SECRET is required')
    }

    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(body)
        .digest('hex')

    return expectedSignature === signature
}
