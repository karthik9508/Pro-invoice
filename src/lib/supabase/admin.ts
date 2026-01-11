import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabaseAdminInstance: SupabaseClient | null = null

/**
 * Get Supabase admin client with service role key.
 * Uses lazy initialization to prevent build-time errors.
 */
export function getSupabaseAdmin(): SupabaseClient {
    if (!supabaseAdminInstance) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

        if (!supabaseUrl || !supabaseServiceKey) {
            throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
        }

        supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        })
    }
    return supabaseAdminInstance
}
