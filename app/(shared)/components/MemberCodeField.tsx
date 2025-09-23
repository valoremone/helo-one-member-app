"use client"
import { useState } from 'react'
import { validatePMC } from '@/lib/pmc'

export default function MemberCodeField({ onValid }: { onValid: (normalized: { core: string; role: string }) => void }) {
  const [value, setValue] = useState("")
  const [error, setError] = useState<string | null>(null)

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.toUpperCase().replace(/[^0-9A-Z–-]/g, "")
    setValue(raw)
    setError(null)
  }

  function onBlur() {
    const v = validatePMC(value)
    if (!v.ok) {
      setError(v.reason === 'checksum' ? 'Invalid check character' : 'Invalid code format')
    } else {
      onValid({ core: v.core!, role: v.role! })
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium">Member Code</label>
      <input value={value} onChange={onChange} onBlur={onBlur} placeholder="F50MHJ7Q9RT2K–C-X" className="mt-1 w-full border px-3 py-2 rounded" />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}


