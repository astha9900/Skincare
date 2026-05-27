'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { formatApiError } from '@/lib/utils'
import { Loader2, Gift } from 'lucide-react'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  referralCode: z.string().optional(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})
type FormData = z.infer<typeof schema>

function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [refCode, setRefCode] = useState('')

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    const ref = searchParams.get('ref')
    if (ref) { setRefCode(ref); setValue('referralCode', ref) }
  }, [searchParams, setValue])

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    const res = await fetch('/api/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        password: data.password,
        referralCode: data.referralCode?.trim() || undefined,
      }),
    })
    const json = await res.json()

    if (!res.ok) {
      setLoading(false)
      toast({ title: 'Signup failed', description: formatApiError(json.error, 'Something went wrong'), variant: 'destructive' })
      return
    }

    if (data.referralCode) {
      toast({ title: '🎉 Welcome bonus!', description: '₹100 has been added to your Skin Wallet.' })
    }

    await signIn('credentials', { email: data.email, password: data.password, redirect: false })
    setLoading(false)
    router.push('/')
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Create account</CardTitle>
        <CardDescription>Join SkinGlow and discover premium skincare</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" placeholder="Priya Sharma" {...register('name')} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" {...register('password')} />
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input id="confirmPassword" type="password" {...register('confirmPassword')} />
            {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
          </div>

          {/* Referral code field */}
          <div className="space-y-2">
            <Label htmlFor="referralCode" className="flex items-center gap-1.5">
              <Gift className="h-3.5 w-3.5 text-pink-500" />
              Referral Code <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              id="referralCode"
              placeholder="e.g. PRIY1A2B"
              value={refCode}
              {...register('referralCode')}
              onChange={(e) => { setRefCode(e.target.value); setValue('referralCode', e.target.value) }}
              className="uppercase placeholder:normal-case"
            />
            {refCode && (
              <p className="text-xs text-green-600 flex items-center gap-1">
                <Gift className="h-3 w-3" />You&apos;ll get ₹100 in your Skin Wallet on joining!
              </p>
            )}
          </div>

          <Button type="submit" className="w-full bg-brand-primary hover:bg-brand-primary/90" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {loading ? 'Creating account…' : 'Create Account'}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="text-brand-primary hover:underline font-semibold">Sign in</Link>
        </p>
      </CardContent>
    </Card>
  )
}

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12 px-4 bg-gradient-to-b from-brand-light/30 to-background">
        <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin" />}>
          <SignupForm />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
