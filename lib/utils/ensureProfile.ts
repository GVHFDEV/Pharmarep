import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Ensures the user's profile row exists in the `profiles` table.
 *
 * The `hcps`, `visits`, `products`, `inventory`, and `pipeline_deals` tables all
 * have a FK `user_id → profiles(id)`. If the profile row is missing (e.g. the user
 * was created before the auto-create trigger was applied), every insert returns a
 * 409 Foreign Key violation.
 *
 * This function does an upsert that is a no-op when the profile already exists.
 */
export async function ensureProfile(
  supabase: SupabaseClient,
  user: { id: string; email?: string; user_metadata?: Record<string, string> }
) {
  const fullName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split('@')[0] ||
    'Usuário'

  await supabase.from('profiles').upsert(
    { id: user.id, full_name: fullName, email: user.email ?? '' },
    { onConflict: 'id', ignoreDuplicates: true }
  )
}
