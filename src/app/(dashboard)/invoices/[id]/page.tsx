'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
import type { Invoice, InvoiceItem, Customer, BusinessProfile } from '@/types'
import {
    ArrowLeft,
    Download,
    Send,
    CheckCircle,
    Edit,
    Loader2,
    FileText
} from 'lucide-react'
import { ClassicTemplate, ModernTemplate, MinimalTemplate } from '@/components/invoice-templates'

export default function InvoiceDetailPage() {
    const params = useParams()
    const router = useRouter()
    const [invoice, setInvoice] = useState<Invoice | null>(null)
    const [items, setItems] = useState<InvoiceItem[]>([])
    const [customer, setCustomer] = useState<Customer | null>(null)
    const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)

    useEffect(() => {
        async function fetchInvoice() {
            const supabase = createClient()

            const { data: invoiceData } = await supabase
                .from('invoices')
                .select('*')
                .eq('id', params.id)
                .single()

            if (invoiceData) {
                setInvoice(invoiceData)

                const { data: itemsData } = await supabase
                    .from('invoice_items')
                    .select('*')
                    .eq('invoice_id', invoiceData.id)

                setItems(itemsData || [])

                const { data: customerData } = await supabase
                    .from('customers')
                    .select('*')
                    .eq('id', invoiceData.customer_id)
                    .single()

                setCustomer(customerData)

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

        fetchInvoice()
    }, [params.id])

    async function updateStatus(status: string) {
        setUpdating(true)
        const supabase = createClient()

        await supabase
            .from('invoices')
            .update({ status })
            .eq('id', params.id)

        setInvoice(prev => prev ? { ...prev, status: status as Invoice['status'] } : null)
        setUpdating(false)
    }

    function handlePrint() {
        window.print()
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
        )
    }

    if (!invoice) {
        return (
            <div className="text-center py-16">
                <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-slate-900 mb-2">Invoice not found</h2>
                <Link href="/invoices" className="text-emerald-600 hover:text-emerald-700">
                    Back to invoices
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
                        href="/invoices"
                        className="p-2 hover:bg-slate-100 rounded-lg transition"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">{invoice.invoice_number}</h1>
                        <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(invoice.status)}`}>
                            {invoice.status}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {invoice.status === 'draft' && (
                        <button
                            onClick={() => updateStatus('sent')}
                            disabled={updating}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition disabled:opacity-50"
                        >
                            <Send className="w-4 h-4" />
                            Mark as Sent
                        </button>
                    )}
                    {(invoice.status === 'sent' || invoice.status === 'overdue') && (
                        <button
                            onClick={() => updateStatus('paid')}
                            disabled={updating}
                            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition disabled:opacity-50"
                        >
                            <CheckCircle className="w-4 h-4" />
                            Mark as Paid
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

            {/* Invoice Preview - Printable */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 print:shadow-none print:border-none overflow-hidden">
                {businessProfile?.invoice_template === 'classic' ? (
                    <ClassicTemplate
                        invoice={invoice}
                        items={items}
                        customer={customer}
                        businessProfile={businessProfile}
                    />
                ) : businessProfile?.invoice_template === 'minimal' ? (
                    <MinimalTemplate
                        invoice={invoice}
                        items={items}
                        customer={customer}
                        businessProfile={businessProfile}
                    />
                ) : (
                    <ModernTemplate
                        invoice={invoice}
                        items={items}
                        customer={customer}
                        businessProfile={businessProfile}
                    />
                )}
            </div>

            {/* Print Styles */}
            <style jsx global>{`
        @media print {
          /* Hide sidebar and navigation */
          aside,
          .print\\:hidden {
            display: none !important;
          }
          
          /* Reset main content area */
          .ml-64 {
            margin-left: 0 !important;
          }
          
          main {
            padding: 20px !important;
            margin: 0 !important;
          }
          
          /* Style the invoice container for print */
          .bg-white {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
          }
          
          /* Ensure colors print properly */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          /* Page settings */
          @page {
            margin: 1cm;
            size: A4;
          }
          
          /* Ensure table rows don't break */
          tr {
            page-break-inside: avoid;
          }
          
          /* Make text black for better printing */
          .text-slate-600,
          .text-slate-500 {
            color: #475569 !important;
          }
          
          .text-slate-900 {
            color: #0f172a !important;
          }
          
          /* Hide gradient backgrounds, use solid colors */
          .bg-gradient-to-r {
            background: #10b981 !important;
          }
        }
      `}</style>
        </div>
    )
}
