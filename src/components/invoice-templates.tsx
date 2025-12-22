import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
import type { Invoice, InvoiceItem, Customer, BusinessProfile } from '@/types'
import { FileText } from 'lucide-react'

interface InvoiceTemplateProps {
    invoice: Invoice
    items: InvoiceItem[]
    customer: Customer | null
    businessProfile: BusinessProfile | null
}

// Classic Template - Traditional professional look
export function ClassicTemplate({ invoice, items, customer, businessProfile }: InvoiceTemplateProps) {
    return (
        <div className="bg-white p-8">
            {/* Header */}
            <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-slate-900">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-1">
                        {businessProfile?.business_name || 'Pro Invoice'}
                    </h1>
                    {businessProfile && (
                        <div className="text-sm text-slate-600 space-y-0.5">
                            {businessProfile.address && <p>{businessProfile.address}</p>}
                            {(businessProfile.city || businessProfile.state) && (
                                <p>{[businessProfile.city, businessProfile.state, businessProfile.postal_code].filter(Boolean).join(', ')}</p>
                            )}
                            {businessProfile.phone && <p>Phone: {businessProfile.phone}</p>}
                            {businessProfile.email && <p>Email: {businessProfile.email}</p>}
                            {businessProfile.tax_id && <p>Tax ID: {businessProfile.tax_id}</p>}
                        </div>
                    )}
                </div>
                <div className="text-right">
                    <h2 className="text-4xl font-bold text-slate-900 tracking-tight">INVOICE</h2>
                    <p className="text-lg font-semibold text-slate-600 mt-2">{invoice.invoice_number}</p>
                </div>
            </div>

            {/* Bill To / Invoice Details */}
            <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Bill To</h3>
                    <p className="font-semibold text-slate-900 text-lg">{customer?.name}</p>
                    <p className="text-slate-600">{customer?.email}</p>
                    {customer?.phone && <p className="text-slate-600">{customer.phone}</p>}
                    {customer?.address && <p className="text-slate-600">{customer.address}</p>}
                </div>
                <div className="text-right">
                    <div className="inline-block text-left">
                        <div className="flex justify-between gap-8 mb-2">
                            <span className="text-slate-500">Issue Date:</span>
                            <span className="font-medium text-slate-900">{formatDate(invoice.issue_date)}</span>
                        </div>
                        <div className="flex justify-between gap-8 mb-2">
                            <span className="text-slate-500">Due Date:</span>
                            <span className="font-medium text-slate-900">{formatDate(invoice.due_date)}</span>
                        </div>
                        <div className="flex justify-between gap-8">
                            <span className="text-slate-500">Status:</span>
                            <span className={`px-2 py-0.5 text-xs font-medium rounded ${getStatusColor(invoice.status)}`}>
                                {invoice.status.toUpperCase()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Line Items Table */}
            <table className="w-full mb-8">
                <thead>
                    <tr className="bg-slate-900 text-white">
                        <th className="text-left py-3 px-4 font-semibold">Description</th>
                        <th className="text-right py-3 px-4 font-semibold">Qty</th>
                        <th className="text-right py-3 px-4 font-semibold">Unit Price</th>
                        <th className="text-right py-3 px-4 font-semibold">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, index) => (
                        <tr key={item.id} className={index % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                            <td className="py-3 px-4 text-slate-900">{item.description}</td>
                            <td className="py-3 px-4 text-right text-slate-600">{item.quantity}</td>
                            <td className="py-3 px-4 text-right text-slate-600">{formatCurrency(item.unit_price)}</td>
                            <td className="py-3 px-4 text-right font-medium text-slate-900">{formatCurrency(item.amount)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end">
                <div className="w-72">
                    <div className="flex justify-between py-2 border-b border-slate-200">
                        <span className="text-slate-600">Subtotal</span>
                        <span className="font-medium text-slate-900">{formatCurrency(invoice.subtotal)}</span>
                    </div>
                    {invoice.tax_rate > 0 && (
                        <div className="flex justify-between py-2 border-b border-slate-200">
                            <span className="text-slate-600">Tax ({invoice.tax_rate}%)</span>
                            <span className="font-medium text-slate-900">{formatCurrency(invoice.subtotal * (invoice.tax_rate / 100))}</span>
                        </div>
                    )}
                    <div className="flex justify-between py-3 bg-slate-900 text-white px-4 -mx-4 mt-2">
                        <span className="font-bold">Total</span>
                        <span className="font-bold text-xl">{formatCurrency(invoice.total)}</span>
                    </div>
                </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
                <div className="mt-8 pt-6 border-t border-slate-200">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Notes</h3>
                    <p className="text-slate-600 whitespace-pre-wrap">{invoice.notes}</p>
                </div>
            )}
        </div>
    )
}

// Modern Template - Colorful gradient design
export function ModernTemplate({ invoice, items, customer, businessProfile }: InvoiceTemplateProps) {
    return (
        <div className="bg-white p-8">
            {/* Header with gradient */}
            <div className="flex justify-between items-start mb-8">
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
                        <div className="text-sm text-slate-600 space-y-0.5">
                            {businessProfile.address && <p>{businessProfile.address}</p>}
                            {(businessProfile.city || businessProfile.state) && (
                                <p>{[businessProfile.city, businessProfile.state, businessProfile.postal_code].filter(Boolean).join(', ')}</p>
                            )}
                            {businessProfile.phone && <p>Phone: {businessProfile.phone}</p>}
                            {businessProfile.email && <p>Email: {businessProfile.email}</p>}
                            {businessProfile.tax_id && <p>Tax ID: {businessProfile.tax_id}</p>}
                        </div>
                    )}
                </div>
                <div className="text-right">
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">INVOICE</h2>
                    <p className="text-lg font-semibold text-emerald-600">{invoice.invoice_number}</p>
                </div>
            </div>

            {/* Bill To / Invoice Details */}
            <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Bill To</h3>
                    <p className="font-semibold text-slate-900 text-lg">{customer?.name}</p>
                    <p className="text-slate-600">{customer?.email}</p>
                    {customer?.phone && <p className="text-slate-600">{customer.phone}</p>}
                    {customer?.address && <p className="text-slate-600">{customer.address}</p>}
                </div>
                <div className="text-right">
                    <div className="mb-3">
                        <p className="text-sm text-slate-500">Issue Date</p>
                        <p className="font-medium text-slate-900">{formatDate(invoice.issue_date)}</p>
                    </div>
                    <div className="mb-3">
                        <p className="text-sm text-slate-500">Due Date</p>
                        <p className="font-medium text-slate-900">{formatDate(invoice.due_date)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Status</p>
                        <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(invoice.status)}`}>
                            {invoice.status}
                        </span>
                    </div>
                </div>
            </div>

            {/* Line Items */}
            <div className="mb-8">
                <table className="w-full">
                    <thead>
                        <tr className="border-b-2 border-slate-200">
                            <th className="text-left py-3 text-sm font-semibold text-slate-600">Description</th>
                            <th className="text-right py-3 text-sm font-semibold text-slate-600">Qty</th>
                            <th className="text-right py-3 text-sm font-semibold text-slate-600">Unit Price</th>
                            <th className="text-right py-3 text-sm font-semibold text-slate-600">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item) => (
                            <tr key={item.id} className="border-b border-slate-100">
                                <td className="py-4 text-slate-900">{item.description}</td>
                                <td className="py-4 text-right text-slate-600">{item.quantity}</td>
                                <td className="py-4 text-right text-slate-600">{formatCurrency(item.unit_price)}</td>
                                <td className="py-4 text-right font-medium text-slate-900">{formatCurrency(item.amount)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
                <div className="w-64 space-y-2">
                    <div className="flex justify-between py-2">
                        <span className="text-slate-600">Subtotal</span>
                        <span className="font-medium text-slate-900">{formatCurrency(invoice.subtotal)}</span>
                    </div>
                    {invoice.tax_rate > 0 && (
                        <div className="flex justify-between py-2">
                            <span className="text-slate-600">Tax ({invoice.tax_rate}%)</span>
                            <span className="font-medium text-slate-900">{formatCurrency(invoice.subtotal * (invoice.tax_rate / 100))}</span>
                        </div>
                    )}
                    <div className="flex justify-between py-3 border-t-2 border-slate-900">
                        <span className="text-lg font-bold text-slate-900">Total</span>
                        <span className="text-lg font-bold text-slate-900">{formatCurrency(invoice.total)}</span>
                    </div>
                </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
                <div className="mt-8 pt-8 border-t border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Notes</h3>
                    <p className="text-slate-600 whitespace-pre-wrap">{invoice.notes}</p>
                </div>
            )}
        </div>
    )
}

// Minimal Template - Clean and simple
export function MinimalTemplate({ invoice, items, customer, businessProfile }: InvoiceTemplateProps) {
    return (
        <div className="bg-white p-8">
            {/* Header - Simple and clean */}
            <div className="mb-12">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-light text-slate-900 mb-4">
                            {businessProfile?.business_name || 'Pro Invoice'}
                        </h1>
                        {businessProfile && (
                            <div className="text-sm text-slate-500 space-y-0.5">
                                {businessProfile.email && <p>{businessProfile.email}</p>}
                                {businessProfile.phone && <p>{businessProfile.phone}</p>}
                                {businessProfile.address && <p>{businessProfile.address}</p>}
                            </div>
                        )}
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-slate-400 uppercase tracking-widest mb-1">Invoice</p>
                        <p className="text-2xl font-light text-slate-900">{invoice.invoice_number}</p>
                    </div>
                </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-2 gap-12 mb-12">
                <div>
                    <p className="text-xs text-slate-400 uppercase tracking-widest mb-2">Billed To</p>
                    <p className="font-medium text-slate-900">{customer?.name}</p>
                    <p className="text-slate-500 text-sm">{customer?.email}</p>
                    {customer?.phone && <p className="text-slate-500 text-sm">{customer.phone}</p>}
                    {customer?.address && <p className="text-slate-500 text-sm">{customer.address}</p>}
                </div>
                <div className="text-right">
                    <div className="mb-4">
                        <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Issue Date</p>
                        <p className="text-slate-900">{formatDate(invoice.issue_date)}</p>
                    </div>
                    <div className="mb-4">
                        <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Due Date</p>
                        <p className="text-slate-900">{formatDate(invoice.due_date)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Status</p>
                        <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded ${getStatusColor(invoice.status)}`}>
                            {invoice.status}
                        </span>
                    </div>
                </div>
            </div>

            {/* Line Items - Minimal styling */}
            <div className="mb-12">
                <div className="border-t border-slate-200">
                    {items.map((item) => (
                        <div key={item.id} className="flex justify-between py-4 border-b border-slate-100">
                            <div className="flex-1">
                                <p className="text-slate-900">{item.description}</p>
                                <p className="text-sm text-slate-400">{item.quantity} × {formatCurrency(item.unit_price)}</p>
                            </div>
                            <p className="font-medium text-slate-900">{formatCurrency(item.amount)}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Totals - Simple right alignment */}
            <div className="flex justify-end">
                <div className="w-48">
                    <div className="flex justify-between py-2 text-slate-500">
                        <span>Subtotal</span>
                        <span>{formatCurrency(invoice.subtotal)}</span>
                    </div>
                    {invoice.tax_rate > 0 && (
                        <div className="flex justify-between py-2 text-slate-500">
                            <span>Tax ({invoice.tax_rate}%)</span>
                            <span>{formatCurrency(invoice.subtotal * (invoice.tax_rate / 100))}</span>
                        </div>
                    )}
                    <div className="flex justify-between py-3 border-t border-slate-900 mt-2">
                        <span className="font-medium text-slate-900">Total</span>
                        <span className="text-xl font-medium text-slate-900">{formatCurrency(invoice.total)}</span>
                    </div>
                </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
                <div className="mt-12 pt-8 border-t border-slate-100">
                    <p className="text-xs text-slate-400 uppercase tracking-widest mb-2">Notes</p>
                    <p className="text-slate-500 text-sm whitespace-pre-wrap">{invoice.notes}</p>
                </div>
            )}

            {/* Tax ID at bottom */}
            {businessProfile?.tax_id && (
                <div className="mt-8 text-center">
                    <p className="text-xs text-slate-400">Tax ID: {businessProfile.tax_id}</p>
                </div>
            )}
        </div>
    )
}
