'use client'

import { Crown } from 'lucide-react'
import Link from 'next/link'

interface UpgradeButtonProps {
    variant?: 'primary' | 'secondary' | 'outline'
    size?: 'sm' | 'md' | 'lg'
    className?: string
}

export function UpgradeButton({ variant = 'primary', size = 'md', className = '' }: UpgradeButtonProps) {
    const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition'

    const variantStyles = {
        primary: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/25',
        secondary: 'bg-emerald-500 text-white hover:bg-emerald-600',
        outline: 'border-2 border-amber-500 text-amber-600 hover:bg-amber-50',
    }

    const sizeStyles = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
    }

    return (
        <Link
            href="/checkout"
            className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        >
            <Crown className="w-4 h-4" />
            Upgrade to Pro
        </Link>
    )
}
