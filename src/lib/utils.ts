import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
    }).format(amount)
}

export function formatDate(date: string | Date): string {
    return new Intl.DateTimeFormat('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(new Date(date))
}

export function generateInvoiceNumber(): string {
    const date = new Date()
    const year = date.getFullYear().toString().slice(-2)
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `INV-${year}${month}-${random}`
}

export function calculateDueDate(days: number = 30): string {
    const date = new Date()
    date.setDate(date.getDate() + days)
    return date.toISOString().split('T')[0]
}

export function getStatusColor(status: string): string {
    switch (status) {
        case 'paid':
            return 'bg-green-100 text-green-800'
        case 'sent':
            return 'bg-blue-100 text-blue-800'
        case 'overdue':
            return 'bg-red-100 text-red-800'
        case 'draft':
        default:
            return 'bg-gray-100 text-gray-800'
    }
}
