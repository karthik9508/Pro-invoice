'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { generateInvoiceNumber, calculateDueDate, formatCurrency } from '@/lib/utils'
import type { InvoiceItemFormData, ParsedInvoice } from '@/types'
import { InvoiceLimitBanner } from '@/components/InvoiceLimitBanner'
import {
    Sparkles,
    Loader2,
    Plus,
    Trash2,
    Send,
    ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

interface LimitStatus {
    canCreate: boolean
    invoicesToday: number
    limit: number
    isPro: boolean
}

export default function NewInvoicePage() {
    const router = useRouter()
    const [prompt, setPrompt] = useState('')
    const [parsing, setParsing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [limitStatus, setLimitStatus] = useState<LimitStatus | null>(null)
    const [loadingLimit, setLoadingLimit] = useState(true)

    // Form state
    const [customerName, setCustomerName] = useState('')
    const [customerEmail, setCustomerEmail] = useState('')
    const [customerPhone, setCustomerPhone] = useState('')
    const [customerAddress, setCustomerAddress] = useState('')
    const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0])
    const [dueDate, setDueDate] = useState(calculateDueDate(30))
    const [items, setItems] = useState<InvoiceItemFormData[]>([
        { description: '', quantity: 1, unit_price: 0 }
    ])
    const [taxRate, setTaxRate] = useState(0)
    const [notes, setNotes] = useState('')

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)
    const taxAmount = subtotal * (taxRate / 100)
    const total = subtotal + taxAmount

    // Check invoice limit on mount
    useEffect(() => {
        async function checkLimit() {
            try {
                const response = await fetch('/api/subscription/status')
                if (response.ok) {
                    const data = await response.json()
                    setLimitStatus(data)
                }
            } catch (err) {
                console.error('Error checking limit:', err)
            } finally {
                setLoadingLimit(false)
            }
        }
        checkLimit()
    }, [])

    async function handleAIParse() {
        if (!prompt.trim()) return

        setParsing(true)
        setError(null)

        try {
            const response = await fetch('/api/ai/parse-invoice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt }),
            })

            if (!response.ok) {
                throw new Error('Failed to parse invoice')
            }

            const data: ParsedInvoice = await response.json()

            // Populate form with parsed data
            if (data.customer) {
                setCustomerName(data.customer.name || '')
                setCustomerEmail(data.customer.email || '')
                setCustomerPhone(data.customer.phone || '')
                setCustomerAddress(data.customer.address || '')
            }

            if (data.items && data.items.length > 0) {
                setItems(data.items)
            }

            if (data.due_date) {
                setDueDate(data.due_date)
            }

            if (data.notes) {
                setNotes(data.notes)
            }

        } catch (err) {
            setError('Failed to parse your request. Please try again or fill in the form manually.')
        } finally {
            setParsing(false)
        }
    }

    function addItem() {
        setItems([...items, { description: '', quantity: 1, unit_price: 0 }])
    }

    function removeItem(index: number) {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index))
        }
    }

    function updateItem(index: number, field: keyof InvoiceItemFormData, value: string | number) {
        const newItems = [...items]
        newItems[index] = { ...newItems[index], [field]: value }
        setItems(newItems)
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        // Double-check limit before submitting
        if (limitStatus && !limitStatus.canCreate) {
            setError('You have reached your daily invoice limit. Please upgrade to Pro for unlimited invoices.')
            return
        }

        setSaving(true)
        setError(null)

        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            setError('You must be logged in')
            setSaving(false)
            return
        }

        try {
            // Create or find customer
            let customerId: string

            const { data: existingCustomer } = await supabase
                .from('customers')
                .select('id')
                .eq('user_id', user.id)
                .eq('email', customerEmail)
                .single()

            if (existingCustomer) {
                customerId = existingCustomer.id
            } else {
                const { data: newCustomer, error: customerError } = await supabase
                    .from('customers')
                    .insert({
                        user_id: user.id,
                        name: customerName,
                        email: customerEmail,
                        phone: customerPhone || null,
                        address: customerAddress || null,
                    })
                    .select('id')
                    .single()

                if (customerError) throw customerError
                customerId = newCustomer.id
            }

            // Create invoice
            const invoiceNumber = generateInvoiceNumber()

            const { data: invoice, error: invoiceError } = await supabase
                .from('invoices')
                .insert({
                    user_id: user.id,
                    customer_id: customerId,
                    invoice_number: invoiceNumber,
                    issue_date: issueDate,
                    due_date: dueDate,
                    status: 'draft',
                    subtotal,
                    tax_rate: taxRate,
                    total,
                    notes: notes || null,
                })
                .select('id')
                .single()

            if (invoiceError) throw invoiceError

            // Create invoice items
            const invoiceItems = items.map(item => ({
                invoice_id: invoice.id,
                description: item.description,
                quantity: item.quantity,
                unit_price: item.unit_price,
                amount: item.quantity * item.unit_price,
            }))

            const { error: itemsError } = await supabase
                .from('invoice_items')
                .insert(invoiceItems)

            if (itemsError) throw itemsError

            router.push(`/invoices/${invoice.id}`)
        } catch (err) {
            console.error(err)
            setError('Failed to create invoice. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    if (loadingLimit) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
        )
    }

    const canCreateInvoice = limitStatus?.canCreate !== false

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link
                    href="/invoices"
                    className="p-2 hover:bg-slate-100 rounded-lg transition"
                >
                    <ArrowLeft className="w-5 h-5 text-slate-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Create New Invoice</h1>
                    <p className="text-slate-500 mt-1">Use AI to generate or fill in manually</p>
                </div>
            </div>

            {/* Invoice Limit Banner */}
            {limitStatus && (
                <InvoiceLimitBanner
                    invoicesToday={limitStatus.invoicesToday}
                    limit={limitStatus.limit}
                    isPro={limitStatus.isPro}
                />
            )}

            {/* Show form only if can create */}
            {canCreateInvoice && (
                <>
                    {/* AI Input Section */}
                    <div className="bg-emerald-500 rounded-2xl p-6 mb-8">
                        <div className="flex items-center gap-2 text-white mb-4">
                            <Sparkles className="w-5 h-5" />
                            <h2 className="font-semibold">AI Invoice Generator</h2>
                        </div>
                        <div className="flex gap-3">
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Describe your invoice in plain English, e.g.: Create an invoice for ABC Company for 10 hours of web development at $100/hour, due in 30 days"
                                className="flex-1 px-4 py-3 rounded-lg bg-white/20 backdrop-blur text-white placeholder-white/60 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 resize-none"
                                rows={3}
                            />
                            <button
                                onClick={handleAIParse}
                                disabled={parsing || !prompt.trim()}
                                className="px-6 py-3 bg-white text-emerald-600 font-semibold rounded-lg hover:bg-white/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 self-end"
                            >
                                {parsing ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Parsing...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5" />
                                        Generate
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                            {error}
                        </div>
                    )}

                    {/* Invoice Form */}
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Customer Details */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">Customer Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Customer Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={customerEmail}
                                        onChange={(e) => setCustomerEmail(e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Phone
                                    </label>
                                    <input
                                        type="tel"
                                        value={customerPhone}
                                        onChange={(e) => setCustomerPhone(e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Address
                                    </label>
                                    <input
                                        type="text"
                                        value={customerAddress}
                                        onChange={(e) => setCustomerAddress(e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-900"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Invoice Details */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">Invoice Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Issue Date
                                    </label>
                                    <input
                                        type="date"
                                        value={issueDate}
                                        onChange={(e) => setIssueDate(e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Due Date
                                    </label>
                                    <input
                                        type="date"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-900"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Line Items */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-slate-900">Line Items</h3>
                                <button
                                    type="button"
                                    onClick={addItem}
                                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Item
                                </button>
                            </div>

                            <div className="space-y-3">
                                {items.map((item, index) => (
                                    <div key={index} className="flex gap-3 items-start">
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                placeholder="Description"
                                                required
                                                value={item.description}
                                                onChange={(e) => updateItem(index, 'description', e.target.value)}
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-900"
                                            />
                                        </div>
                                        <div className="w-24">
                                            <input
                                                type="number"
                                                placeholder="Qty"
                                                required
                                                min="0.01"
                                                step="0.01"
                                                value={item.quantity}
                                                onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-900"
                                            />
                                        </div>
                                        <div className="w-32">
                                            <input
                                                type="number"
                                                placeholder="Unit Price"
                                                required
                                                min="0"
                                                step="0.01"
                                                value={item.unit_price}
                                                onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-900"
                                            />
                                        </div>
                                        <div className="w-28 py-2 text-right font-medium text-slate-700">
                                            {formatCurrency(item.quantity * item.unit_price)}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeItem(index)}
                                            disabled={items.length === 1}
                                            className="p-2 text-slate-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Totals */}
                            <div className="mt-6 pt-6 border-t border-slate-200 space-y-2">
                                <div className="flex justify-end gap-8">
                                    <span className="text-slate-600">Subtotal</span>
                                    <span className="font-medium w-32 text-right text-slate-900">{formatCurrency(subtotal)}</span>
                                </div>
                                <div className="flex justify-end items-center gap-8">
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-600">Tax</span>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            step="0.1"
                                            value={taxRate}
                                            onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                                            className="w-16 px-2 py-1 text-center border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                                        />
                                        <span className="text-slate-600">%</span>
                                    </div>
                                    <span className="font-medium w-32 text-right text-slate-900">{formatCurrency(taxAmount)}</span>
                                </div>
                                <div className="flex justify-end gap-8 text-lg font-bold">
                                    <span className="text-slate-900">Total</span>
                                    <span className="w-32 text-right text-emerald-600">{formatCurrency(total)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">Notes</h3>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Additional notes or payment instructions..."
                                rows={3}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none text-slate-900"
                            />
                        </div>

                        {/* Submit */}
                        <div className="flex justify-end gap-4">
                            <Link
                                href="/invoices"
                                className="px-6 py-3 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-6 py-3 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        Create Invoice
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </>
            )}
        </div>
    )
}
