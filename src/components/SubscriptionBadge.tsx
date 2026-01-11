'use client'

import { Crown, Zap } from 'lucide-react'
import type { SubscriptionPlan } from '@/types'

interface SubscriptionBadgeProps {
    plan: SubscriptionPlan
    size?: 'sm' | 'md' | 'lg'
    showIcon?: boolean
}

export function SubscriptionBadge({ plan, size = 'md', showIcon = true }: SubscriptionBadgeProps) {
    const isPro = plan === 'pro'

    const sizeStyles = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-sm',
        lg: 'px-3 py-1.5 text-base',
    }

    const iconSizes = {
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
        lg: 'w-5 h-5',
    }

    if (isPro) {
        return (
            <span className={`inline-flex items-center gap-1 ${sizeStyles[size]} font-semibold rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white`}>
                {showIcon && <Crown className={iconSizes[size]} />}
                PRO
            </span>
        )
    }

    return (
        <span className={`inline-flex items-center gap-1 ${sizeStyles[size]} font-medium rounded-full bg-slate-100 text-slate-600`}>
            {showIcon && <Zap className={iconSizes[size]} />}
            Free
        </span>
    )
}
