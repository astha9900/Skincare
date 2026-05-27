'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useToast } from '@/hooks/use-toast'
import { formatApiError } from '@/lib/utils'
import { RefreshCw, RotateCcw, CheckCircle, Clock, XCircle } from 'lucide-react'

interface OrderItem { id: string; productName: string; quantity: number }

interface ReturnRequest {
  id: string; type: string; reason: string; status: string
  exchangeFor: string | null; adminNote: string | null; createdAt: string
}

const STATUS_STYLES: Record<string, { cls: string; icon: React.ReactNode; label: string }> = {
  PENDING:   { cls: 'bg-amber-100 text-amber-800',  icon: <Clock className="h-3.5 w-3.5" />,        label: 'Pending Review' },
  APPROVED:  { cls: 'bg-green-100 text-green-800',  icon: <CheckCircle className="h-3.5 w-3.5" />,  label: 'Approved' },
  REJECTED:  { cls: 'bg-red-100 text-red-800',      icon: <XCircle className="h-3.5 w-3.5" />,      label: 'Rejected' },
  COMPLETED: { cls: 'bg-blue-100 text-blue-800',    icon: <CheckCircle className="h-3.5 w-3.5" />,  label: 'Completed' },
}

const REASONS = [
  'Product is damaged or defective',
  'Received wrong product',
  'Product does not match description',
  'Allergic reaction / skin irritation',
  'Changed my mind',
  'Other',
]

export function ReturnExchangeDialog({ items }: { items: OrderItem[] }) {
  const params = useParams()
  const orderId = params?.id as string
  const { toast } = useToast()

  const [open, setOpen] = useState(false)
  const [type, setType] = useState<'RETURN' | 'EXCHANGE'>('RETURN')
  const [reason, setReason] = useState('')
  const [customReason, setCustomReason] = useState('')
  const [exchangeFor, setExchangeFor] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [existing, setExisting] = useState<ReturnRequest | null | undefined>(undefined)

  useEffect(() => {
    fetch(`/api/orders/${orderId}/return`)
      .then((r) => r.json())
      .then((d) => setExisting(d))
      .catch(() => setExisting(null))
  }, [orderId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const fullReason = reason === 'Other' ? customReason : reason
    if (!fullReason.trim() || fullReason.length < 10) {
      toast({ title: 'Please provide a reason (min 10 characters)', variant: 'destructive' })
      return
    }
    setSubmitting(true)
    const res = await fetch(`/api/orders/${orderId}/return`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        reason: fullReason,
        items: items.map((i) => ({ productName: i.productName, quantity: i.quantity })),
        exchangeFor: type === 'EXCHANGE' ? exchangeFor : undefined,
      }),
    })
    const data = await res.json()
    setSubmitting(false)
    if (res.ok) {
      setExisting(data)
      setOpen(false)
      toast({ title: `${type === 'RETURN' ? 'Return' : 'Exchange'} request submitted!`, description: 'We will review it within 2–3 business days.' })
    } else {
      toast({ title: 'Failed', description: formatApiError(data.error), variant: 'destructive' })
    }
  }

  // Still loading
  if (existing === undefined) return null

  // Already submitted — show status card
  if (existing) {
    const s = STATUS_STYLES[existing.status] ?? STATUS_STYLES.PENDING
    return (
      <div className="border rounded-lg p-4 space-y-2">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-sm">{existing.type === 'RETURN' ? '↩ Return' : '🔄 Exchange'} Request</p>
          <Badge className={`${s.cls} flex items-center gap-1 text-xs`}>{s.icon}{s.label}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">{existing.reason}</p>
        {existing.exchangeFor && <p className="text-sm"><span className="font-medium">Exchange for:</span> {existing.exchangeFor}</p>}
        {existing.adminNote && (
          <div className="bg-muted rounded p-2 text-xs text-muted-foreground">
            <span className="font-semibold">Admin note: </span>{existing.adminNote}
          </div>
        )}
        {existing.status === 'APPROVED' && existing.type === 'RETURN' && (
          <p className="text-xs text-green-600 font-medium">Refund has been credited to your Skin Wallet.</p>
        )}
      </div>
    )
  }

  return (
    <>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="flex-1" onClick={() => { setType('RETURN'); setOpen(true) }}>
          <RotateCcw className="h-4 w-4 mr-1.5" />Return Item
        </Button>
        <Button variant="outline" size="sm" className="flex-1" onClick={() => { setType('EXCHANGE'); setOpen(true) }}>
          <RefreshCw className="h-4 w-4 mr-1.5" />Exchange Item
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{type === 'RETURN' ? 'Request a Return' : 'Request an Exchange'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Request Type</Label>
              <RadioGroup value={type} onValueChange={(v) => setType(v as 'RETURN' | 'EXCHANGE')} className="flex gap-4">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="RETURN" id="type-return" />
                  <Label htmlFor="type-return" className="cursor-pointer">Return & Refund</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="EXCHANGE" id="type-exchange" />
                  <Label htmlFor="type-exchange" className="cursor-pointer">Exchange</Label>
                </div>
              </RadioGroup>
            </div>

            {type === 'RETURN' && (
              <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded p-3 text-sm text-green-700 dark:text-green-400">
                Refund will be credited to your <strong>Skin Wallet</strong> within 24 hrs of approval.
              </div>
            )}

            <div className="space-y-2">
              <Label>Reason</Label>
              <RadioGroup value={reason} onValueChange={setReason} className="space-y-2">
                {REASONS.map((r) => (
                  <div key={r} className="flex items-center gap-2">
                    <RadioGroupItem value={r} id={`reason-${r}`} />
                    <Label htmlFor={`reason-${r}`} className="cursor-pointer text-sm font-normal">{r}</Label>
                  </div>
                ))}
              </RadioGroup>
              {reason === 'Other' && (
                <Textarea
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Describe your reason (min 10 characters)"
                  rows={3} className="mt-2"
                />
              )}
            </div>

            {type === 'EXCHANGE' && (
              <div className="space-y-1">
                <Label htmlFor="exchange-for">What would you like instead? (optional)</Label>
                <Input
                  id="exchange-for"
                  value={exchangeFor}
                  onChange={(e) => setExchangeFor(e.target.value)}
                  placeholder="e.g. Same product, different size / variant"
                />
              </div>
            )}

            <div className="border rounded p-3 space-y-1">
              <p className="text-xs font-semibold text-muted-foreground">Items in this request</p>
              {items.map((item) => (
                <p key={item.id} className="text-sm">{item.productName} × {item.quantity}</p>
              ))}
            </div>

            <div className="flex gap-2 pt-1">
              <Button type="submit" className="flex-1 bg-brand-primary hover:bg-brand-primary/90 text-white" disabled={submitting || !reason}>
                {submitting ? 'Submitting…' : `Submit ${type === 'RETURN' ? 'Return' : 'Exchange'}`}
              </Button>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
