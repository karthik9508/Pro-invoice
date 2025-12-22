import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
import { FileText, AlertTriangle, Clock, CheckCircle } from 'lucide-react'

export default async function ReceivablesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch unpaid invoices
    const { data: unpaidInvoices } = await supabase
        .from('invoices')
        .select('*, customer:customers(name, email)')
        .eq('user_id', user?.id)
        .in('status', ['sent', 'overdue'])
        .order('due_date', { ascending: true })

    // Calculate totals
    const totalOutstanding = unpaidInvoices?.reduce((sum, inv) => sum + (inv.total || 0), 0) || 0
    const overdueInvoices = unpaidInvoices?.filter(inv => {
        const dueDate = new Date(inv.due_date)
        return dueDate < new Date() && inv.status !== 'paid'
    }) || []
    const overdueAmount = overdueInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0)

    // Check and update overdue status
    for (const inv of overdueInvoices) {
        if (inv.status === 'sent') {
            await supabase
                .from('invoices')
                .update({ status: 'overdue' })
                .eq('id', inv.id)
            inv.status = 'overdue'
        }
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Receivables</h1>
                <p className="text-slate-500 mt-1">Track outstanding payments and overdue invoices</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                            <Clock className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Total Outstanding</p>
                            <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalOutstanding)}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Overdue Amount</p>
                            <p className="text-2xl font-bold text-red-600">{formatCurrency(overdueAmount)}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Unpaid Invoices</p>
                            <p className="text-2xl font-bold text-slate-900">{unpaidInvoices?.length || 0}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Outstanding Invoices */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="px-6 py-4 border-b border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-900">Outstanding Invoices</h2>
                </div>

                {unpaidInvoices && unpaidInvoices.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200">
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Invoice</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Customer</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Due Date</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Days</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Amount</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {unpaidInvoices.map((invoice) => {
                                    const dueDate = new Date(invoice.due_date)
                                    const today = new Date()
                                    const diffTime = dueDate.getTime() - today.getTime()
                                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                                    const isOverdue = diffDays < 0

                                    return (
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
                                                {formatDate(invoice.due_date)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`font-medium ${isOverdue ? 'text-red-600' : 'text-slate-600'}`}>
                                                    {isOverdue ? `${Math.abs(diffDays)} days overdue` : `${diffDays} days left`}
                                                </span>
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
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="px-6 py-16 text-center">
                        <CheckCircle className="w-16 h-16 text-green-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 mb-2">All caught up!</h3>
                        <p className="text-slate-500">No outstanding invoices at the moment.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
