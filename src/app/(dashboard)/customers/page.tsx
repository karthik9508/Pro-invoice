import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Users, Plus, Mail, Phone, MapPin } from 'lucide-react'

export default async function CustomersPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: customers } = await supabase
        .from('customers')
        .select('*, invoices(id, total, status)')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
                    <p className="text-slate-500 mt-1">Manage your customer list</p>
                </div>
            </div>

            {/* Customer Grid */}
            {customers && customers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {customers.map((customer) => {
                        const totalInvoices = customer.invoices?.length || 0
                        const totalRevenue = customer.invoices?.reduce((sum: number, inv: { total: number }) => sum + (inv.total || 0), 0) || 0
                        const unpaidCount = customer.invoices?.filter((inv: { status: string }) => inv.status !== 'paid').length || 0

                        return (
                            <Link
                                key={customer.id}
                                href={`/customers/${customer.id}`}
                                className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md hover:border-emerald-300 transition block"
                            >
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                        {customer.name[0].toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-slate-900 truncate">{customer.name}</h3>
                                        <div className="flex items-center gap-1 text-sm text-slate-500 mt-1">
                                            <Mail className="w-3.5 h-3.5" />
                                            <span className="truncate">{customer.email}</span>
                                        </div>
                                    </div>
                                </div>

                                {customer.phone && (
                                    <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                                        <Phone className="w-4 h-4" />
                                        {customer.phone}
                                    </div>
                                )}

                                {customer.address && (
                                    <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
                                        <MapPin className="w-4 h-4" />
                                        {customer.address}
                                    </div>
                                )}

                                <div className="pt-4 border-t border-slate-100 grid grid-cols-3 gap-4 text-center">
                                    <div>
                                        <p className="text-2xl font-bold text-slate-900">{totalInvoices}</p>
                                        <p className="text-xs text-slate-500">Invoices</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
                                        <p className="text-xs text-slate-500">Total</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-orange-500">{unpaidCount}</p>
                                        <p className="text-xs text-slate-500">Unpaid</p>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-slate-100">
                                    <span className="text-sm text-emerald-600 font-medium">
                                        View Statement →
                                    </span>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 px-6 py-16 text-center">
                    <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No customers yet</h3>
                    <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                        Customers are automatically added when you create invoices.
                    </p>
                    <Link
                        href="/invoices/new"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition"
                    >
                        <Plus className="w-4 h-4" />
                        Create Your First Invoice
                    </Link>
                </div>
            )}
        </div>
    )
}
