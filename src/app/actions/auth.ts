'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
    try {
        const supabase = await createClient()

        const data = {
            email: formData.get('email') as string,
            password: formData.get('password') as string,
        }

        const { error } = await supabase.auth.signInWithPassword(data)

        if (error) {
            return { error: error.message }
        }

        revalidatePath('/', 'layout')
        redirect('/dashboard')
    } catch (error) {
        console.error('Login error:', error)
        // Check if it's a redirect (which throws in Next.js)
        if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
            throw error
        }
        return { error: 'An unexpected error occurred. Please try again.' }
    }
}

export async function signup(formData: FormData) {
    try {
        const supabase = await createClient()

        const data = {
            email: formData.get('email') as string,
            password: formData.get('password') as string,
        }

        const { error } = await supabase.auth.signUp(data)

        if (error) {
            return { error: error.message }
        }

        revalidatePath('/', 'layout')
        redirect('/dashboard')
    } catch (error) {
        console.error('Signup error:', error)
        // Check if it's a redirect (which throws in Next.js)
        if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
            throw error
        }
        return { error: 'An unexpected error occurred. Please try again.' }
    }
}

export async function signout() {
    try {
        const supabase = await createClient()
        await supabase.auth.signOut()
        redirect('/login')
    } catch (error) {
        console.error('Signout error:', error)
        // Check if it's a redirect (which throws in Next.js)
        if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
            throw error
        }
        redirect('/login')
    }
}

export async function signInWithGoogle() {
    try {
        const supabase = await createClient()

        // Use production URL in production, localhost in development
        const isProduction = process.env.NODE_ENV === 'production'
        const baseUrl = isProduction
            ? 'https://www.proinvoice.cloud'
            : 'http://localhost:3000'

        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${baseUrl}/auth/callback`,
            },
        })

        if (error) {
            return { error: error.message }
        }

        if (data.url) {
            redirect(data.url)
        }
    } catch (error) {
        console.error('Google sign-in error:', error)
        // Check if it's a redirect (which throws in Next.js)
        if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
            throw error
        }
        return { error: 'Failed to initiate Google sign-in. Please try again.' }
    }
}

