'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { BusinessProfile, InvoiceTemplate, SubscriptionPlan } from '@/types'
import { SubscriptionBadge } from '@/components/SubscriptionBadge'
import { UpgradeButton } from '@/components/UpgradeButton'
import {
    Building2,
    Save,
    Loader2,
    Mail,
    Phone,
    MapPin,
    Globe,
    FileText,
    Layout,
    Crown,
    CreditCard,
    Zap,
    Check,
    ExternalLink
} from 'lucide-react'

interface SubscriptionData {
    plan: SubscriptionPlan
    invoicesToday: number
    canCreate: boolean
    isPro: boolean
    limit: number
}

export default function ProfilePage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [subscription, setSubscription] = useState<SubscriptionData | null>(null)

    // Form state
    const [businessName, setBusinessName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [address, setAddress] = useState('')
    const [city, setCity] = useState('')
    const [state, setState] = useState('')
    const [postalCode, setPostalCode] = useState('')
    const [country, setCountry] = useState('')
    const [taxId, setTaxId] = useState('')
    const [website, setWebsite] = useState('')
    const [invoiceTemplate, setInvoiceTemplate] = useState<InvoiceTemplate>('modern')

    useEffect(() => {
        async function fetchData() {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                // Fetch profile
                const { data: profile } = await supabase
                    .from('business_profiles')
                    .select('*')
                    .eq('user_id', user.id)
                    .single()

                if (profile) {
                    setBusinessName(profile.business_name || '')
                    setEmail(profile.email || '')
                    setPhone(profile.phone || '')
                    setAddress(profile.address || '')
                    setCity(profile.city || '')
                    setState(profile.state || '')
                    setPostalCode(profile.postal_code || '')
                    setCountry(profile.country || '')
                    setTaxId(profile.tax_id || '')
                    setWebsite(profile.website || '')
                    setInvoiceTemplate(profile.invoice_template || 'modern')
                }

                // Fetch subscription status
                try {
                    const response = await fetch('/api/subscription/status')
                    if (response.ok) {
                        const subData = await response.json()
                        setSubscription({
                            ...subData,
                            plan: subData.isPro ? 'pro' : 'free',
                        })
                    }
                } catch (err) {
                    console.error('Error fetching subscription:', err)
                }
            }

            setLoading(false)
        }

        fetchData()
    }, [])

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setSaving(true)
        setError(null)
        setSuccess(false)

        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            setError('You must be logged in')
            setSaving(false)
            return
        }

        try {
            // Check if profile exists
            const { data: existing } = await supabase
                .from('business_profiles')
                .select('id')
                .eq('user_id', user.id)
                .single()

            const profileData = {
                user_id: user.id,
                business_name: businessName,
                email: email || null,
                phone: phone || null,
                address: address || null,
                city: city || null,
                state: state || null,
                postal_code: postalCode || null,
                country: country || null,
                tax_id: taxId || null,
                website: website || null,
                invoice_template: invoiceTemplate,
                updated_at: new Date().toISOString(),
            }

            if (existing) {
                // Update existing profile
                const { error: updateError } = await supabase
                    .from('business_profiles')
                    .update(profileData)
                    .eq('id', existing.id)

                if (updateError) throw updateError
            } else {
                // Create new profile
                const { error: insertError } = await supabase
                    .from('business_profiles')
                    .insert(profileData)

                if (insertError) throw insertError
            }

            setSuccess(true)
            setTimeout(() => setSuccess(false), 3000)
        } catch (err) {
            console.error(err)
            setError('Failed to save profile. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Business Profile</h1>
                <p className="text-slate-500 mt-1">This information will appear on your invoices and statements</p>
            </div>

            {/* Subscription Section */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-emerald-500" />
                    Subscription
                </h3>

                {subscription?.isPro ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center">
                                    <Crown className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-lg text-amber-900">Pro Plan</span>
                                        <SubscriptionBadge plan="pro" size="sm" />
                                    </div>
                                    <p className="text-amber-700 text-sm">Unlimited invoice creation</p>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="p-3 bg-slate-50 rounded-lg">
                                <div className="text-2xl font-bold text-slate-900">∞</div>
                                <div className="text-xs text-slate-500">Invoices/Day</div>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-lg">
                                <div className="text-2xl font-bold text-emerald-600">
                                    <Check className="w-6 h-6 mx-auto" />
                                </div>
                                <div className="text-xs text-slate-500">AI Generation</div>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-lg">
                                <div className="text-2xl font-bold text-emerald-600">
                                    <Check className="w-6 h-6 mx-auto" />
                                </div>
                                <div className="text-xs text-slate-500">Priority Support</div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center">
                                    <Zap className="w-6 h-6 text-slate-500" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-lg text-slate-900">Free Plan</span>
                                        <SubscriptionBadge plan="free" size="sm" />
                                    </div>
                                    <p className="text-slate-500 text-sm">
                                        {subscription?.invoicesToday || 0} of {subscription?.limit || 5} invoices used today
                                    </p>
                                </div>
                            </div>
                            <UpgradeButton size="sm" />
                        </div>

                        {/* Features Comparison */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 border border-slate-200 rounded-xl">
                                <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                                    <Zap className="w-4 h-4" />
                                    Free
                                </h4>
                                <ul className="space-y-2 text-sm text-slate-600">
                                    <li className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-emerald-500" />
                                        5 invoices per day
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-emerald-500" />
                                        AI invoice generation
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-emerald-500" />
                                        3 invoice templates
                                    </li>
                                </ul>
                            </div>
                            <div className="p-4 border-2 border-amber-300 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50">
                                <h4 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
                                    <Crown className="w-4 h-4" />
                                    Pro
                                </h4>
                                <ul className="space-y-2 text-sm text-amber-800">
                                    <li className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-amber-600" />
                                        <strong>Unlimited</strong> invoices
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-amber-600" />
                                        AI invoice generation
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-amber-600" />
                                        All templates
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-amber-600" />
                                        Priority support
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                    Profile saved successfully!
                </div>
            )}

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Business Name */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-emerald-500" />
                        Business Information
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Business Name *
                            </label>
                            <input
                                type="text"
                                required
                                value={businessName}
                                onChange={(e) => setBusinessName(e.target.value)}
                                placeholder="Your Company Name"
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-900"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Tax ID / GST Number
                            </label>
                            <input
                                type="text"
                                value={taxId}
                                onChange={(e) => setTaxId(e.target.value)}
                                placeholder="e.g., 22AAAAA0000A1Z5"
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-900"
                            />
                        </div>
                    </div>
                </div>

                {/* Contact */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <Mail className="w-5 h-5 text-emerald-500" />
                        Contact Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="contact@company.com"
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-900"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Phone
                            </label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+91 98765 43210"
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-900"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Website
                            </label>
                            <input
                                type="url"
                                value={website}
                                onChange={(e) => setWebsite(e.target.value)}
                                placeholder="https://www.company.com"
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-900"
                            />
                        </div>
                    </div>
                </div>

                {/* Address */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-emerald-500" />
                        Address
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Street Address
                            </label>
                            <input
                                type="text"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="123 Business Street"
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-900"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    City
                                </label>
                                <input
                                    type="text"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    placeholder="Mumbai"
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-900"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    State
                                </label>
                                <input
                                    type="text"
                                    value={state}
                                    onChange={(e) => setState(e.target.value)}
                                    placeholder="Maharashtra"
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-900"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Postal Code
                                </label>
                                <input
                                    type="text"
                                    value={postalCode}
                                    onChange={(e) => setPostalCode(e.target.value)}
                                    placeholder="400001"
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-900"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Country
                                </label>
                                <input
                                    type="text"
                                    value={country}
                                    onChange={(e) => setCountry(e.target.value)}
                                    placeholder="India"
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-900"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Invoice Template */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <Layout className="w-5 h-5 text-emerald-500" />
                        Invoice Template
                    </h3>
                    <p className="text-sm text-slate-500 mb-4">Choose a template style for your invoices</p>
                    <div className="grid grid-cols-3 gap-4">
                        {/* Classic Template */}
                        <button
                            type="button"
                            onClick={() => setInvoiceTemplate('classic')}
                            className={`p-4 border-2 rounded-xl transition-all ${invoiceTemplate === 'classic' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`}
                        >
                            <div className="aspect-[3/4] bg-white border border-slate-200 rounded-lg mb-3 p-2 overflow-hidden">
                                <div className="h-6 bg-slate-900 mb-2 rounded"></div>
                                <div className="space-y-1">
                                    <div className="h-2 bg-slate-200 rounded w-3/4"></div>
                                    <div className="h-2 bg-slate-200 rounded w-1/2"></div>
                                </div>
                                <div className="mt-2 space-y-1">
                                    <div className="h-1.5 bg-slate-900 rounded"></div>
                                    <div className="h-1.5 bg-slate-100 rounded"></div>
                                    <div className="h-1.5 bg-slate-100 rounded"></div>
                                </div>
                            </div>
                            <p className="font-medium text-slate-900 text-sm">Classic</p>
                            <p className="text-xs text-slate-500">Professional & Traditional</p>
                        </button>

                        {/* Modern Template */}
                        <button
                            type="button"
                            onClick={() => setInvoiceTemplate('modern')}
                            className={`p-4 border-2 rounded-xl transition-all ${invoiceTemplate === 'modern' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`}
                        >
                            <div className="aspect-[3/4] bg-white border border-slate-200 rounded-lg mb-3 p-2 overflow-hidden">
                                <div className="flex gap-2 mb-2">
                                    <div className="w-4 h-4 bg-emerald-500 rounded"></div>
                                    <div className="h-2 bg-slate-200 rounded flex-1 mt-1"></div>
                                </div>
                                <div className="space-y-1">
                                    <div className="h-2 bg-slate-200 rounded w-2/3"></div>
                                    <div className="h-2 bg-slate-200 rounded w-1/2"></div>
                                </div>
                                <div className="mt-2 space-y-1">
                                    <div className="h-1.5 bg-slate-200 rounded"></div>
                                    <div className="h-1.5 bg-slate-100 rounded"></div>
                                    <div className="h-1.5 bg-slate-100 rounded"></div>
                                </div>
                            </div>
                            <p className="font-medium text-slate-900 text-sm">Modern</p>
                            <p className="text-xs text-slate-500">Colorful & Stylish</p>
                        </button>

                        {/* Minimal Template */}
                        <button
                            type="button"
                            onClick={() => setInvoiceTemplate('minimal')}
                            className={`p-4 border-2 rounded-xl transition-all ${invoiceTemplate === 'minimal' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`}
                        >
                            <div className="aspect-[3/4] bg-white border border-slate-200 rounded-lg mb-3 p-2 overflow-hidden">
                                <div className="space-y-1 mb-3">
                                    <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                                    <div className="h-1.5 bg-slate-100 rounded w-1/3"></div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <div className="h-1.5 bg-slate-100 rounded w-1/2"></div>
                                        <div className="h-1.5 bg-slate-200 rounded w-1/4"></div>
                                    </div>
                                    <div className="flex justify-between">
                                        <div className="h-1.5 bg-slate-100 rounded w-1/2"></div>
                                        <div className="h-1.5 bg-slate-200 rounded w-1/4"></div>
                                    </div>
                                </div>
                            </div>
                            <p className="font-medium text-slate-900 text-sm">Minimal</p>
                            <p className="text-xs text-slate-500">Clean & Simple</p>
                        </button>
                    </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={saving || !businessName.trim()}
                        className="px-6 py-3 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                Save Profile
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}
