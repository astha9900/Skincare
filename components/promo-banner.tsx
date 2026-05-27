'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'

function pad(n: number) { return String(n).padStart(2, '0') }

export function PromoBanner() {
  const [visible, setVisible] = useState(true)
  const [timeLeft, setTimeLeft] = useState({ h: 23, m: 59, s: 59 })

  useEffect(() => {
    const id = setInterval(() => {
      setTimeLeft((prev) => {
        let { h, m, s } = prev
        s--
        if (s < 0) { s = 59; m-- }
        if (m < 0) { m = 59; h-- }
        if (h < 0) return { h: 23, m: 59, s: 59 }
        return { h, m, s }
      })
    }, 1000)
    return () => clearInterval(id)
  }, [])

  if (!visible) return null

  return (
    <div className="bg-brand-primary text-white py-2 px-4 text-center text-sm relative">
      <span>🎉 FLAT 20% OFF on orders above ₹499 — Use code </span>
      <Badge variant="secondary" className="mx-1 font-bold text-brand-primary">FIRST20</Badge>
      <span>· Ends in </span>
      <span className="font-mono font-bold">{pad(timeLeft.h)}:{pad(timeLeft.m)}:{pad(timeLeft.s)}</span>
      <button
        onClick={() => setVisible(false)}
        aria-label="Close banner"
        className="absolute right-3 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
