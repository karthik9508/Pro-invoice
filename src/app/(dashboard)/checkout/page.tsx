'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    Crown,
    Check,
    Zap,
    Shield,
    Loader2,
    ArrowLeft,
    Sparkles,
} from 'lucide-react'

declare global {
    interface Window {
        Razorpay: any
    }
}

// Configure your pricing here
const PRO_PRICE_MONTHLY = 399 // ₹399/month
const PRO_PRICE_YEARLY = 1999 // ₹1999/year

export default function CheckoutPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

    const price = billingCycle === 'monthly' ? PRO_PRICE_MONTHLY : PRO_PRICE_YEARLY
    const period = billingCycle === 'monthly' ? 'month' : 'year'
    const savings = (PRO_PRICE_MONTHLY * 12) - PRO_PRICE_YEARLY

    async function handleProceedToPay() {
        setLoading(true)
        try {
            // Create subscription on backend with selected billing cycle
            const response = await fetch('/api/razorpay/create-subscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ billingCycle }),
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to create subscription')
            }

            const { subscriptionId, keyId } = await response.json()

            // Load Razorpay script if not already loaded
            if (!window.Razorpay) {
                await loadRazorpayScript()
            }

            // Open Razorpay checkout
            const options = {
                key: keyId,
                subscription_id: subscriptionId,
                name: 'Pro Invoice',
                description: `Pro Subscription - ${billingCycle === 'monthly' ? 'Monthly' : 'Yearly'}`,
                image: '/logo.png',
                handler: async function (response: {
                    razorpay_payment_id: string
                    razorpay_subscription_id: string
                    razorpay_signature: string
                }) {
                    // Verify payment on backend
                    const verifyResponse = await fetch('/api/razorpay/verify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(response),
                    })

                    if (verifyResponse.ok) {
                        router.push('/profile?success=true')
                    } else {
                        alert('Payment verification failed. Please contact support.')
                    }
                },
                prefill: {},
                theme: {
                    color: '#10b981', // Neo Green primary color
                },
                modal: {
                    ondismiss: function () {
                        setLoading(false)
                    },
                },
            }

            const razorpay = new window.Razorpay(options)
            razorpay.open()
        } catch (error: unknown) {
            console.error('Checkout error:', error)
            const errorMessage = error instanceof Error ? error.message : 'Failed to start checkout'
            alert(errorMessage)
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50/30">
            {/* Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <Link
                        href="/profile"
                        className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Profile
                    </Link>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-12">
                {/* Title */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium mb-4">
                        <Sparkles className="w-4 h-4" />
                        Upgrade to Pro
                    </div>
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">
                        Unlock Unlimited Invoices
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Remove the daily limit and create as many invoices as you need.
                        Perfect for growing businesses.
                    </p>
                </div>

                {/* Pricing Card */}
                <div className="max-w-md mx-auto">
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                        {/* Plan Header */}
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6 text-white text-center">
                            <Crown className="w-12 h-12 mx-auto mb-3" />
                            <h2 className="text-2xl font-bold">Pro Plan</h2>
                        </div>

                        {/* Billing Toggle */}
                        <div className="p-6 border-b border-slate-200">
                            <div className="flex items-center justify-center gap-3 bg-slate-100 p-1 rounded-lg">
                                <button
                                    onClick={() => setBillingCycle('monthly')}
                                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${billingCycle === 'monthly'
                                            ? 'bg-white text-slate-900 shadow'
                                            : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                >
                                    Monthly
                                </button>
                                <button
                                    onClick={() => setBillingCycle('yearly')}
                                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition relative ${billingCycle === 'yearly'
                                            ? 'bg-white text-slate-900 shadow'
                                            : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                >
                                    Yearly
                                    <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full">
                                        Save ₹{savings}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Price Display */}
                        <div className="p-6 text-center border-b border-slate-200">
                            <div className="flex items-baseline justify-center gap-1">
                                <span className="text-2xl text-slate-600">₹</span>
                                <span className="text-5xl font-bold text-slate-900">{price}</span>
                                <span className="text-slate-500">/{period}</span>
                            </div>
                            {billingCycle === 'yearly' && (
                                <p className="text-emerald-600 text-sm mt-2">
                                    That&apos;s just ₹{Math.round(PRO_PRICE_YEARLY / 12)}/month!
                                </p>
                            )}
                        </div>

                        {/* Features */}
                        <div className="p-6 space-y-4">
                            <h3 className="font-semibold text-slate-900 mb-4">What&apos;s included:</h3>

                            <div className="flex items-start gap-3">
                                <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Check className="w-3 h-3 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-slate-900">Unlimited Invoices</p>
                                    <p className="text-sm text-slate-500">No daily limits, create as many as you need</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Check className="w-3 h-3 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-slate-900">AI Invoice Generation</p>
                                    <p className="text-sm text-slate-500">Create invoices with natural language</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Check className="w-3 h-3 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-slate-900">All Invoice Templates</p>
                                    <p className="text-sm text-slate-500">Access to premium templates</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Check className="w-3 h-3 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-slate-900">Priority Support</p>
                                    <p className="text-sm text-slate-500">Get help faster when you need it</p>
                                </div>
                            </div>
                        </div>

                        {/* CTA Button */}
                        <div className="p-6 bg-slate-50">
                            <button
                                onClick={handleProceedToPay}
                                disabled={loading}
                                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-lg rounded-xl hover:from-emerald-600 hover:to-teal-600 transition shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Shield className="w-5 h-5" />
                                        Proceed to Pay ₹{price}
                                    </>
                                )}
                            </button>
                            <p className="text-center text-xs text-slate-500 mt-4">
                                Secure payment powered by Razorpay. Cancel anytime.
                            </p>
                        </div>
                    </div>

                    {/* Trust Badges */}
                    <div className="flex items-center justify-center gap-6 mt-8 text-slate-500">
                        <div className="flex items-center gap-2 text-sm">
                            <Shield className="w-4 h-4" />
                            Secure Payment
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <Zap className="w-4 h-4" />
                            Instant Access
                        </div>
                    </div>
                </div>

                {/* Compare Plans */}
                <div className="mt-16">
                    <h3 className="text-center text-xl font-bold text-slate-900 mb-8">Compare Plans</h3>
                    <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                        {/* Free Plan */}
                        <div className="bg-white rounded-xl p-6 border border-slate-200">
                            <div className="flex items-center gap-2 mb-4">
                                <Zap className="w-5 h-5 text-slate-400" />
                                <h4 className="font-semibold text-slate-900">Free</h4>
                            </div>
                            <p className="text-3xl font-bold text-slate-900 mb-4">₹0</p>
                            <ul className="space-y-2 text-sm text-slate-600">
                                <li className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-slate-400" />
                                    5 invoices per day
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-slate-400" />
                                    AI invoice generation
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-slate-400" />
                                    3 templates
                                </li>
                            </ul>
                        </div>

                        {/* Pro Plan */}
                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border-2 border-emerald-300 relative">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                                RECOMMENDED
                            </div>
                            <div className="flex items-center gap-2 mb-4">
                                <Crown className="w-5 h-5 text-emerald-600" />
                                <h4 className="font-semibold text-emerald-900">Pro</h4>
                            </div>
                            <p className="text-3xl font-bold text-emerald-900 mb-4">₹{PRO_PRICE_MONTHLY}<span className="text-base font-normal">/mo</span></p>
                            <ul className="space-y-2 text-sm text-emerald-800">
                                <li className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-emerald-600" />
                                    <strong>Unlimited</strong> invoices
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-emerald-600" />
                                    AI invoice generation
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-emerald-600" />
                                    All templates
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-emerald-600" />
                                    Priority support
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function loadRazorpayScript(): Promise<void> {
    return new Promise((resolve, reject) => {
        if (document.getElementById('razorpay-script')) {
            resolve()
            return
        }

        const script = document.createElement('script')
        script.id = 'razorpay-script'
        script.src = 'https://checkout.razorpay.com/v1/checkout.js'
        script.onload = () => resolve()
        script.onerror = () => reject(new Error('Failed to load Razorpay'))
        document.body.appendChild(script)
    })
}
