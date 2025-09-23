import { describe, test, expect } from 'vitest'
import { deriveNM2, deriveSIG, buildCore, validatePMC, formatUrlSafe, parseUrlSafePmc } from './index'

describe('PMC', () => {
  test('NM2 derivation', () => {
    expect(deriveNM2('Matt', 'Hardage')).toBe('MH')
    expect(deriveNM2('John', 'Smith')).toBe('JS')
    expect(deriveNM2('Ana', 'Li')).toBe('AL')
  })

  test('SIG determinism', () => {
    const a = deriveSIG('19881203', '123456')
    const b = deriveSIG('19881203', '123456')
    expect(a).toBe(b)
  })

  test('Validate PMC happy path', () => {
    const nm2 = 'MH'
    const sig = 'J7Q9'
    const rand = 'RT2K'
    const { core } = buildCore('F50', nm2, sig, rand)
    const code = `F50${nm2}${sig}${rand}-${core.slice(-1)}-X`
    const v = validatePMC(code)
    expect(v.ok).toBe(true)
    expect(v.core).toBe(core)
    expect(v.role).toBe('X')
  })

  test('URL-safe PMC format', () => {
    const nm2 = 'MH'
    const sig = 'J7Q9'
    const rand = 'RT2K'
    const { core } = buildCore('F50', nm2, sig, rand)
    const urlSafe = formatUrlSafe(core, 'X')
    const parsed = parseUrlSafePmc(urlSafe)
    expect(parsed).toEqual({ core, role: 'X' })
  })
})


