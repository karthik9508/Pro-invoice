import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { signout } from '@/app/actions/auth'
import {
    FileText,
    LayoutDashboard,
    Users,
    Receipt,
    LogOut,
    Plus,
    Building2
} from 'lucide-react'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Sidebar */}
            <aside className="fixed inset-y-0 left-0 w-64 bg-slate-900 text-white">
                {/* Logo */}
                <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800">
                    <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-lg">Pro Invoice</span>
                </div>

                {/* Navigation */}
                <nav className="px-4 py-6 space-y-2">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition"
                    >
                        <LayoutDashboard className="w-5 h-5" />
                        Dashboard
                    </Link>
                    <Link
                        href="/invoices"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition"
                    >
                        <Receipt className="w-5 h-5" />
                        Invoices
                    </Link>
                    <Link
                        href="/customers"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition"
                    >
                        <Users className="w-5 h-5" />
                        Customers
                    </Link>
                    <Link
                        href="/receivables"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition"
                    >
                        <FileText className="w-5 h-5" />
                        Receivables
                    </Link>
                    <Link
                        href="/profile"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition"
                    >
                        <Building2 className="w-5 h-5" />
                        Business Profile
                    </Link>
                </nav>

                {/* Create New Invoice Button */}
                <div className="px-4 mt-4">
                    <Link
                        href="/invoices/new"
                        className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-500 rounded-lg font-semibold hover:bg-emerald-600 transition"
                    >
                        <Plus className="w-5 h-5" />
                        New Invoice
                    </Link>
                </div>

                {/* User Section */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800">
                    <div className="flex items-center gap-3 px-2 mb-3">
                        <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-sm font-medium">
                            {user.email?.[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{user.email}</p>
                        </div>
                    </div>
                    <form action={signout}>
                        <button
                            type="submit"
                            className="flex items-center gap-3 w-full px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign out
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="ml-64 p-8">
                {children}
            </main>
        </div>
    )
}
