'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
import type { Customer, Invoice, BusinessProfile } from '@/types'
import {
    ArrowLeft,
    FileText,
    Loader2,
    Download,
    Mail,
    Phone,
    MapPin,
    MessageCircle
} from 'lucide-react'

export default function CustomerStatementPage() {
    const params = useParams()
    const [customer, setCustomer] = useState<Customer | null>(null)
    const [invoices, setInvoices] = useState<Invoice[]>([])
    const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            const supabase = createClient()

            const { data: customerData } = await supabase
                .from('customers')
                .select('*')
                .eq('id', params.id)
                .single()

            if (customerData) {
                setCustomer(customerData)

                const { data: invoicesData } = await supabase
                    .from('invoices')
                    .select('*')
                    .eq('customer_id', customerData.id)
                    .order('issue_date', { ascending: false })

                setInvoices(invoicesData || [])

                // Fetch business profile
                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                    const { data: profileData } = await supabase
                        .from('business_profiles')
                        .select('*')
                        .eq('user_id', user.id)
                        .single()
                    setBusinessProfile(profileData)
                }
            }

            setLoading(false)
        }

        fetchData()
    }, [params.id])

    // Calculate summary stats
    const totalSales = invoices.reduce((sum, inv) => sum + inv.total, 0)
    const paidAmount = invoices
        .filter(inv => inv.status === 'paid')
        .reduce((sum, inv) => sum + inv.total, 0)
    const outstandingAmount = invoices
        .filter(inv => inv.status !== 'paid')
        .reduce((sum, inv) => sum + inv.total, 0)

    // Aging breakdown (days outstanding)
    const today = new Date()
    const aging = {
        current: 0,      // 0-30 days
        days30_60: 0,    // 31-60 days
        days60_90: 0,    // 61-90 days
        over90: 0        // 90+ days
    }

    invoices.forEach(inv => {
        if (inv.status === 'paid') return

        const dueDate = new Date(inv.due_date)
        const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))

        if (daysOverdue <= 0) {
            aging.current += inv.total
        } else if (daysOverdue <= 30) {
            aging.current += inv.total
        } else if (daysOverdue <= 60) {
            aging.days30_60 += inv.total
        } else if (daysOverdue <= 90) {
            aging.days60_90 += inv.total
        } else {
            aging.over90 += inv.total
        }
    })

    function handlePrint() {
        window.print()
    }

    function sendWhatsAppReminder() {
        if (!customer?.phone) {
            alert('No phone number available for this customer')
            return
        }

        // Clean phone number (remove spaces, dashes, etc.)
        const cleanPhone = customer.phone.replace(/[^\d+]/g, '')

        // Generate message
        const unpaidInvoices = invoices.filter(inv => inv.status !== 'paid')
        const invoiceList = unpaidInvoices
            .map(inv => `• ${inv.invoice_number}: ${formatCurrency(inv.total)}`)
            .join('\n')

        const message = `Hi ${customer.name},

This is a friendly reminder about your outstanding payment.

Outstanding Amount: ${formatCurrency(outstandingAmount)}

Invoices:
${invoiceList}

Please let us know if you have any questions.

Thank you!
${businessProfile?.business_name || 'Pro Invoice'}`

        // Open WhatsApp with pre-filled message
        const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
        window.open(whatsappUrl, '_blank')
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
        )
    }

    if (!customer) {
        return (
            <div className="text-center py-16">
                <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-slate-900 mb-2">Customer not found</h2>
                <Link href="/customers" className="text-emerald-600 hover:text-emerald-700">
                    Back to customers
                </Link>
            </div>
        )
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-8 print:hidden">
                <div className="flex items-center gap-4">
                    <Link
                        href="/customers"
                        className="p-2 hover:bg-slate-100 rounded-lg transition"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Customer Statement</h1>
                        <p className="text-slate-500">{customer.name}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {customer.phone && outstandingAmount > 0 && (
                        <button
                            onClick={sendWhatsAppReminder}
                            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition"
                        >
                            <MessageCircle className="w-4 h-4" />
                            Send WhatsApp Reminder
                        </button>
                    )}
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition"
                    >
                        <Download className="w-4 h-4" />
                        Download PDF
                    </button>
                </div>
            </div>

            {/* Statement Content - Printable */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 print:shadow-none print:border-none">
                {/* Header */}
                <div className="flex justify-between items-start mb-8 pb-6 border-b border-slate-200">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
                                <FileText className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold text-slate-900">
                                {businessProfile?.business_name || 'Pro Invoice'}
                            </span>
                        </div>
                        {businessProfile && (
                            <div className="text-sm text-slate-600 space-y-0.5 mb-2">
                                {businessProfile.address && <p>{businessProfile.address}</p>}
                                {(businessProfile.city || businessProfile.state) && (
                                    <p>{[businessProfile.city, businessProfile.state, businessProfile.postal_code].filter(Boolean).join(', ')}</p>
                                )}
                                {businessProfile.phone && <p>Phone: {businessProfile.phone}</p>}
                                {businessProfile.email && <p>Email: {businessProfile.email}</p>}
                            </div>
                        )}
                        <p className="text-sm text-slate-500">Statement as of {formatDate(new Date().toISOString())}</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">STATEMENT</h2>
                    </div>
                </div>

                {/* Customer Info */}
                <div className="mb-8">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Customer</h3>
                    <p className="text-xl font-semibold text-slate-900">{customer.name}</p>
                    <div className="flex flex-wrap gap-4 mt-2 text-slate-600">
                        {customer.email && (
                            <span className="flex items-center gap-1">
                                <Mail className="w-4 h-4" />
                                {customer.email}
                            </span>
                        )}
                        {customer.phone && (
                            <span className="flex items-center gap-1">
                                <Phone className="w-4 h-4" />
                                {customer.phone}
                            </span>
                        )}
                        {customer.address && (
                            <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {customer.address}
                            </span>
                        )}
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-slate-50 rounded-lg p-4">
                        <p className="text-sm text-slate-500 mb-1">Total Sales</p>
                        <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalSales)}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                        <p className="text-sm text-green-600 mb-1">Paid</p>
                        <p className="text-2xl font-bold text-green-700">{formatCurrency(paidAmount)}</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4">
                        <p className="text-sm text-orange-600 mb-1">Outstanding</p>
                        <p className="text-2xl font-bold text-orange-700">{formatCurrency(outstandingAmount)}</p>
                    </div>
                </div>

                {/* Aging Report */}
                {outstandingAmount > 0 && (
                    <div className="mb-8 p-4 bg-slate-50 rounded-lg">
                        <h3 className="text-sm font-semibold text-slate-700 mb-3">Aging Report (Outstanding)</h3>
                        <div className="grid grid-cols-4 gap-4 text-center">
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Current (0-30 days)</p>
                                <p className="font-semibold text-slate-900">{formatCurrency(aging.current)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 mb-1">31-60 days</p>
                                <p className="font-semibold text-orange-600">{formatCurrency(aging.days30_60)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 mb-1">61-90 days</p>
                                <p className="font-semibold text-orange-700">{formatCurrency(aging.days60_90)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Over 90 days</p>
                                <p className="font-semibold text-red-600">{formatCurrency(aging.over90)}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Invoice List */}
                <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-3">Transaction History</h3>
                    {invoices.length > 0 ? (
                        <table className="w-full">
                            <thead>
                                <tr className="border-b-2 border-slate-200">
                                    <th className="text-left py-3 text-sm font-semibold text-slate-600">Invoice</th>
                                    <th className="text-left py-3 text-sm font-semibold text-slate-600">Date</th>
                                    <th className="text-left py-3 text-sm font-semibold text-slate-600">Due Date</th>
                                    <th className="text-right py-3 text-sm font-semibold text-slate-600">Amount</th>
                                    <th className="text-right py-3 text-sm font-semibold text-slate-600">Status</th>
                                    <th className="text-right py-3 text-sm font-semibold text-slate-600">Balance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.map((invoice) => {
                                    const balance = invoice.status === 'paid' ? 0 : invoice.total
                                    return (
                                        <tr key={invoice.id} className="border-b border-slate-100">
                                            <td className="py-3">
                                                <Link
                                                    href={`/invoices/${invoice.id}`}
                                                    className="font-medium text-emerald-600 hover:text-emerald-700 print:text-slate-900"
                                                >
                                                    {invoice.invoice_number}
                                                </Link>
                                            </td>
                                            <td className="py-3 text-slate-600">{formatDate(invoice.issue_date)}</td>
                                            <td className="py-3 text-slate-600">{formatDate(invoice.due_date)}</td>
                                            <td className="py-3 text-right text-slate-900">{formatCurrency(invoice.total)}</td>
                                            <td className="py-3 text-right">
                                                <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(invoice.status)}`}>
                                                    {invoice.status}
                                                </span>
                                            </td>
                                            <td className="py-3 text-right font-medium text-slate-900">
                                                {formatCurrency(balance)}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                            <tfoot>
                                <tr className="border-t-2 border-slate-900">
                                    <td colSpan={5} className="py-3 text-right font-bold text-slate-900">
                                        Total Outstanding:
                                    </td>
                                    <td className="py-3 text-right font-bold text-slate-900">
                                        {formatCurrency(outstandingAmount)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    ) : (
                        <p className="text-slate-500 text-center py-8">No invoices found for this customer.</p>
                    )}
                </div>
            </div>

            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    aside,
                    .print\\:hidden {
                        display: none !important;
                    }
                    .ml-64 {
                        margin-left: 0 !important;
                    }
                    main {
                        padding: 20px !important;
                    }
                    .bg-white {
                        box-shadow: none !important;
                        border: none !important;
                    }
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    @page {
                        margin: 1cm;
                        size: A4;
                    }
                }
            `}</style>
        </div>
    )
}
