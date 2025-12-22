// Database types
export interface Customer {
    id: string
    user_id: string
    name: string
    email: string
    phone?: string
    address?: string
    created_at: string
}

export interface Invoice {
    id: string
    user_id: string
    customer_id: string
    invoice_number: string
    issue_date: string
    due_date: string
    status: 'draft' | 'sent' | 'paid' | 'overdue'
    subtotal: number
    tax_rate: number
    total: number
    notes?: string
    created_at: string
    // Joined data
    customer?: Customer
    items?: InvoiceItem[]
}

export interface InvoiceItem {
    id: string
    invoice_id: string
    description: string
    quantity: number
    unit_price: number
    amount: number
}

// Form types
export interface InvoiceFormData {
    customer_id?: string
    customer_name?: string
    customer_email?: string
    issue_date: string
    due_date: string
    items: InvoiceItemFormData[]
    tax_rate: number
    notes?: string
}

export interface InvoiceItemFormData {
    description: string
    quantity: number
    unit_price: number
}

// AI parsing response
export interface ParsedInvoice {
    customer: {
        name: string
        email?: string
        phone?: string
        address?: string
    }
    items: InvoiceItemFormData[]
    due_date?: string
    notes?: string
}

// Business profile
export type InvoiceTemplate = 'classic' | 'modern' | 'minimal'

export interface BusinessProfile {
    id: string
    user_id: string
    business_name: string
    email?: string
    phone?: string
    address?: string
    city?: string
    state?: string
    postal_code?: string
    country?: string
    tax_id?: string
    website?: string
    invoice_template?: InvoiceTemplate
    created_at: string
    updated_at: string
}
