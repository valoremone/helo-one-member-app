import { createClient } from '@/lib/supabaseServer'
import { parseUrlSafePmc } from './index'

/**
 * Convert a PMC to a member UUID
 * @param pmc - The Public Member Code
 * @returns The member UUID or null if not found
 */
export async function pmcToMemberId(pmc: string): Promise<string | null> {
  try {
    const supabase = await createClient()
    
    // Check if it's a URL-safe PMC (no separators)
    const urlSafeParsed = parseUrlSafePmc(pmc)
    if (urlSafeParsed) {
      // Look up by core and role
      const { data, error } = await supabase
        .from('member_codes')
        .select('member_id')
        .eq('core', urlSafeParsed.core)
        .eq('role', urlSafeParsed.role)
        .eq('status', 'active')
        .single()

      if (!error && data) {
        return data.member_id
      }
    }
    
    // Try to find the PMC with the exact display string
    let { data, error } = await supabase
      .from('member_codes')
      .select('member_id')
      .eq('display', pmc)
      .eq('status', 'active')
      .single()

    // If not found, try with the other dash character
    if (error || !data) {
      const alternatePmc = pmc.includes('–') ? pmc.replace(/–/g, '-') : pmc.replace(/-/g, '–')
      const { data: altData, error: altError } = await supabase
        .from('member_codes')
        .select('member_id')
        .eq('display', alternatePmc)
        .eq('status', 'active')
        .single()
      
      if (!altError && altData) {
        data = altData
        error = null
      }
    }

    if (error || !data) {
      console.error('PMC not found in database:', error)
      return null
    }

    return data.member_id
  } catch (error) {
    console.error('Error looking up PMC:', error)
    return null
  }
}

/**
 * Convert a member UUID to their active PMC
 * @param memberId - The member UUID
 * @returns The PMC display string or null if not found
 */
export async function memberIdToPmc(memberId: string): Promise<string | null> {
  try {
    const supabase = await createClient()
    
    // Get the active PMC for the member
    const { data, error } = await supabase
      .from('member_codes')
      .select('display')
      .eq('member_id', memberId)
      .eq('status', 'active')
      .single()

    if (error || !data) {
      console.error('No active PMC found for member:', error)
      return null
    }

    return data.display
  } catch (error) {
    console.error('Error looking up member PMC:', error)
    return null
  }
}

/**
 * Check if a string is a valid PMC format
 * @param input - The string to check
 * @returns True if it looks like a PMC
 */
export function isPmcFormat(input: string): boolean {
  // Check if it matches URL-safe PMC pattern: CORE+ROLE (15 chars, no separators)
  const urlSafePattern = /^[A-Z0-9]{15}$/
  if (urlSafePattern.test(input.toUpperCase().trim())) {
    return true
  }
  
  // Check if it matches the display PMC pattern: TIER+NM2+SIG+RAND–CHK-ROLE
  const pmcPattern = /^[A-Z0-9]{2,3}[A-Z0-9]{2}[A-Z0-9]{4}[A-Z0-9]{4}[–-][A-Z0-9]-[A-Z]$/
  return pmcPattern.test(input.toUpperCase().trim())
}

/**
 * Check if a string is a UUID format
 * @param input - The string to check
 * @returns True if it looks like a UUID
 */
export function isUuidFormat(input: string): boolean {
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidPattern.test(input)
}
