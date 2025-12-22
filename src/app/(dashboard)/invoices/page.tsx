import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
import { FileText, Plus, Search } from 'lucide-react'

export default async function InvoicesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: invoices } = await supabase
        .from('invoices')
        .select('*, customer:customers(name, email)')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Invoices</h1>
                    <p className="text-slate-500 mt-1">Manage and track your invoices</p>
                </div>
                <Link
                    href="/invoices/new"
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition"
                >
                    <Plus className="w-5 h-5" />
                    New Invoice
                </Link>
            </div>

            {/* Invoice List */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                {invoices && invoices.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200">
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Invoice</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Customer</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Date</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Due Date</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Amount</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {invoices.map((invoice) => (
                                    <tr key={invoice.id} className="hover:bg-slate-50 transition">
                                        <td className="px-6 py-4">
                                            <Link
                                                href={`/invoices/${invoice.id}`}
                                                className="font-medium text-emerald-600 hover:text-emerald-700"
                                            >
                                                {invoice.invoice_number}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-slate-900">{invoice.customer?.name}</p>
                                                <p className="text-sm text-slate-500">{invoice.customer?.email}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {formatDate(invoice.issue_date)}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {formatDate(invoice.due_date)}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-900">
                                            {formatCurrency(invoice.total)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(invoice.status)}`}>
                                                {invoice.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="px-6 py-16 text-center">
                        <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 mb-2">No invoices yet</h3>
                        <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                            Create your first invoice using AI. Just describe what you need in plain English.
                        </p>
                        <Link
                            href="/invoices/new"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition"
                        >
                            <Plus className="w-4 h-4" />
                            Create Invoice with AI
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
