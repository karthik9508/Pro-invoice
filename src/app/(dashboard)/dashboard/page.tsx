import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
import {
    FileText,
    Users,
    TrendingUp,
    Clock,
    Plus,
    ArrowRight
} from 'lucide-react'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch summary data
    const { count: totalInvoices } = await supabase
        .from('invoices')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id)

    const { count: totalCustomers } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id)

    const { data: paidInvoices } = await supabase
        .from('invoices')
        .select('total')
        .eq('user_id', user?.id)
        .eq('status', 'paid')

    const { data: unpaidInvoices } = await supabase
        .from('invoices')
        .select('total')
        .eq('user_id', user?.id)
        .in('status', ['sent', 'overdue'])

    const totalRevenue = paidInvoices?.reduce((sum, inv) => sum + (inv.total || 0), 0) || 0
    const totalOutstanding = unpaidInvoices?.reduce((sum, inv) => sum + (inv.total || 0), 0) || 0

    // Recent invoices
    const { data: recentInvoices } = await supabase
        .from('invoices')
        .select('*, customer:customers(name)')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5)

    const stats = [
        {
            label: 'Total Invoices',
            value: totalInvoices || 0,
            icon: FileText,
            color: 'bg-blue-500',
        },
        {
            label: 'Total Customers',
            value: totalCustomers || 0,
            icon: Users,
            color: 'bg-emerald-500',
        },
        {
            label: 'Total Revenue',
            value: formatCurrency(totalRevenue),
            icon: TrendingUp,
            color: 'bg-green-500',
        },
        {
            label: 'Outstanding',
            value: formatCurrency(totalOutstanding),
            icon: Clock,
            color: 'bg-orange-500',
        },
    ]

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                    <p className="text-slate-500 mt-1">Welcome back! Here&apos;s your business overview.</p>
                </div>
                <Link
                    href="/invoices/new"
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition"
                >
                    <Plus className="w-5 h-5" />
                    New Invoice
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                                <stat.icon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">{stat.label}</p>
                                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Invoices */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-slate-900">Recent Invoices</h2>
                    <Link href="/invoices" className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center gap-1">
                        View all <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {recentInvoices && recentInvoices.length > 0 ? (
                    <div className="divide-y divide-slate-200">
                        {recentInvoices.map((invoice) => (
                            <Link
                                key={invoice.id}
                                href={`/invoices/${invoice.id}`}
                                className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                                        <FileText className="w-5 h-5 text-slate-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900">{invoice.invoice_number}</p>
                                        <p className="text-sm text-slate-500">
                                            {invoice.customer?.name || 'Unknown Customer'}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium text-slate-900">{formatCurrency(invoice.total)}</p>
                                    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(invoice.status)}`}>
                                        {invoice.status}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="px-6 py-12 text-center">
                        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500 mb-4">No invoices yet</p>
                        <Link
                            href="/invoices/new"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg font-medium hover:bg-emerald-200 transition"
                        >
                            <Plus className="w-4 h-4" />
                            Create your first invoice
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
