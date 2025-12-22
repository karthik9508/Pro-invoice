import Link from 'next/link'
import { FileText, Sparkles, Download, Users, ArrowRight } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-900">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Pro Invoice</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="px-4 py-2 text-white/80 hover:text-white transition"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 bg-white text-slate-900 font-semibold rounded-lg hover:bg-white/90 transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 rounded-full text-emerald-300 text-sm mb-8">
          <Sparkles className="w-4 h-4" />
          Powered by AI
        </div>
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
          Create Invoices with
          <span className="text-emerald-400"> AI Magic</span>
        </h1>
        <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
          Just describe your invoice in plain English. Let AI handle the rest.
          Create, preview, and download professional invoices in seconds.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/signup"
            className="px-8 py-4 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition flex items-center gap-2"
          >
            Start Creating Free
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/login"
            className="px-8 py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white/5 backdrop-blur rounded-2xl p-8 border border-white/10">
            <div className="w-14 h-14 bg-emerald-500 rounded-xl flex items-center justify-center mb-6">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">AI-Powered Creation</h3>
            <p className="text-slate-400">
              Describe your invoice in plain English. Our AI understands customer details,
              line items, and pricing automatically.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur rounded-2xl p-8 border border-white/10">
            <div className="w-14 h-14 bg-emerald-500 rounded-xl flex items-center justify-center mb-6">
              <Download className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Instant PDF Download</h3>
            <p className="text-slate-400">
              Preview your invoice and download a professional PDF instantly.
              Share it with clients right away.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur rounded-2xl p-8 border border-white/10">
            <div className="w-14 h-14 bg-emerald-500 rounded-xl flex items-center justify-center mb-6">
              <Users className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Track Receivables</h3>
            <p className="text-slate-400">
              Keep track of outstanding payments. Know who owes what and when
              payments are due.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <div className="bg-emerald-500/20 rounded-3xl p-12 border border-white/10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to simplify invoicing?
          </h2>
          <p className="text-slate-300 mb-8 max-w-xl mx-auto">
            Join thousands of small businesses using AI to create professional invoices in seconds.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-900 font-semibold rounded-xl hover:bg-white/90 transition"
          >
            Get Started for Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-10 border-t border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-semibold">Pro Invoice</span>
          </div>
          <p className="text-slate-500 text-sm">
            © 2024 Pro Invoice. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
