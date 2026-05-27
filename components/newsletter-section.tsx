'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { Mail } from 'lucide-react'

export function NewsletterSection() {
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [subscribed, setSubscribed] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await fetch('/api/newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
    setLoading(false)
    setSubscribed(true)
    toast({ title: 'Subscribed!', description: 'You\'ll receive our best skincare tips and offers.' })
  }

  return (
    <section className="py-16 bg-brand-primary/5 dark:bg-brand-primary/10">
      <div className="container mx-auto px-4 text-center max-w-xl">
        <Mail className="h-10 w-10 mx-auto mb-4 text-brand-primary" />
        <h2 className="text-2xl font-bold mb-2">Get Skincare Tips & Exclusive Offers</h2>
        <p className="text-muted-foreground mb-6">Join 50,000+ skincare enthusiasts. No spam, unsubscribe anytime.</p>

        {subscribed ? (
          <p className="text-green-600 font-semibold text-lg">You&apos;re subscribed! 🎉</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2 max-w-sm mx-auto">
            <Input type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="flex-1" />
            <Button type="submit" className="bg-brand-primary hover:bg-brand-primary/90 text-white" disabled={loading}>
              {loading ? '…' : 'Subscribe'}
            </Button>
          </form>
        )}
      </div>
    </section>
  )
}
