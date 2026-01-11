'use client'

import { Crown, Check, Zap } from 'lucide-react'
import { UpgradeButton } from './UpgradeButton'

interface InvoiceLimitBannerProps {
    invoicesToday: number
    limit: number
    isPro: boolean
}

export function InvoiceLimitBanner({ invoicesToday, limit, isPro }: InvoiceLimitBannerProps) {
    if (isPro) {
        return (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center">
                        <Crown className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-amber-900">Pro Member</p>
                        <p className="text-sm text-amber-700">Unlimited invoice creation</p>
                    </div>
                </div>
            </div>
        )
    }

    const remaining = limit - invoicesToday
    const isAtLimit = remaining <= 0

    if (isAtLimit) {
        return (
            <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-6 mb-6">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                        <Zap className="w-6 h-6 text-red-500" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-lg text-red-900 mb-1">Daily Limit Reached</h3>
                        <p className="text-red-700 mb-4">
                            You&apos;ve used all {limit} free invoices for today. Upgrade to Pro for unlimited invoice creation!
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <UpgradeButton size="md" />
                            <p className="text-sm text-red-600 self-center">
                                Or wait until tomorrow for your limit to reset.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                        <p className="font-medium text-slate-900">
                            {remaining} of {limit} free invoices remaining today
                        </p>
                        <p className="text-sm text-slate-500">
                            Upgrade to Pro for unlimited invoices
                        </p>
                    </div>
                </div>
                <UpgradeButton size="sm" variant="outline" />
            </div>
        </div>
    )
}
