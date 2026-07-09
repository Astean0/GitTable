import { createClient } from '@supabase/supabase-js'

const isPlaceholderValue = (value: string | undefined) => {
  if (!value) return true

  const normalized = value.trim().toLowerCase()
  return normalized === '' || normalized.includes('your_') || normalized.includes('placeholder') || normalized === 'null'
}

const rawSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
const rawSupabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim()
const supabaseUrl = isPlaceholderValue(rawSupabaseUrl) ? 'https://example.supabase.co' : rawSupabaseUrl
const supabaseKey = isPlaceholderValue(rawSupabaseKey) ? 'placeholder-key' : rawSupabaseKey

export const supabase = createClient(supabaseUrl as string, supabaseKey as string, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})
