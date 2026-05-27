'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { formatApiError } from '@/lib/utils'
import { getCart, clearCart, type CartItem } from '@/lib/cart'
import { Loader2, MapPin, CreditCard, Package, ShieldCheck, Smartphone, Wallet } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import Image from 'next/image'
import Link from 'next/link'

const INDIAN_STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh','Puducherry','Chandigarh','Andaman & Nicobar','Dadra & NH','Daman & Diu','Lakshadweep']

const addressSchema = z.object({
  name: z.string().min(2, 'Required'),
  phone: z.string().min(10, 'Enter valid phone'),
  line1: z.string().min(5, 'Required'),
  line2: z.string().optional(),
  city: z.string().min(2, 'Required'),
  state: z.string().min(1, 'Select state'),
  pincode: z.string().length(6, 'Enter 6-digit pincode'),
})
type AddressForm = z.infer<typeof addressSchema>

interface SavedAddress { id: string; name: string; phone: string; line1: string; line2?: string; city: string; state: string; pincode: string; isDefault: boolean }

type CardType = 'visa' | 'mastercard' | 'rupay' | 'amex' | 'unknown'

function detectCardType(number: string): CardType {
  const raw = number.replace(/\s/g, '')
  if (/^4/.test(raw)) return 'visa'
  if (/^5[1-5]/.test(raw)) return 'mastercard'
  if (/^6/.test(raw)) return 'rupay'
  if (/^3[47]/.test(raw)) return 'amex'
  return 'unknown'
}

function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 16)
  return digits.replace(/(.{4})/g, '$1 ').trim()
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4)
  if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return digits
}

const UPI_REGEX = /^[\w.\-_]{2,256}@[a-zA-Z]{2,64}$/

export default function CheckoutPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([])
  const [selectedAddress, setSelectedAddress] = useState<string>('new')
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'UPI' | 'CARD'>('COD')
  const [coupon, setCoupon] = useState<{ code: string; discountAmount: number } | null>(null)
  const [walletBalance, setWalletBalance] = useState(0)
  const [useWallet, setUseWallet] = useState(false)
  const [loading, setLoading] = useState(false)

  // UPI state
  const [upiId, setUpiId] = useState('')
  const [upiError, setUpiError] = useState('')

  // Card state
  const [cardNumber, setCardNumber] = useState('')
  const [cardName, setCardName] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({})
  const cardType = detectCardType(cardNumber)

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
  })

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login?redirect=/checkout')
    }
  }, [status, router])

  useEffect(() => {
    setCartItems(getCart())
    const stored = sessionStorage.getItem('coupon')
    if (stored) setCoupon(JSON.parse(stored))
    if (session) {
      fetch('/api/users/addresses').then((r) => r.json()).then((data) => {
        if (Array.isArray(data)) { setSavedAddresses(data); if (data.length > 0) setSelectedAddress(data[0].id) }
      })
      fetch('/api/users/wallet').then((r) => r.json()).then((data) => {
        if (data?.balance) setWalletBalance(data.balance)
      })
    }
  }, [session])

  useEffect(() => {
    if (selectedAddress === 'new') return

    const addr = savedAddresses.find((address) => address.id === selectedAddress)
    if (!addr) return

    setValue('name', addr.name)
    setValue('phone', addr.phone)
    setValue('line1', addr.line1)
    setValue('line2', addr.line2 ?? '')
    setValue('city', addr.city)
    setValue('state', addr.state)
    setValue('pincode', addr.pincode)
  }, [savedAddresses, selectedAddress, setValue])

  const subtotal = cartItems.reduce((sum, i) => sum + (i.price ?? 0) * i.quantity, 0)
  const discount = coupon?.discountAmount ?? 0
  const afterCoupon = subtotal - discount
  const walletDeduction = useWallet ? Math.min(walletBalance, afterCoupon) : 0
  const shipping = afterCoupon - walletDeduction >= 499 ? 0 : 49
  const total = afterCoupon - walletDeduction + shipping

  function validatePayment(): boolean {
    if (paymentMethod === 'UPI') {
      if (!upiId.trim()) { setUpiError('Enter your UPI ID'); return false }
      if (!UPI_REGEX.test(upiId.trim())) { setUpiError('Invalid UPI ID (e.g. name@okicici)'); return false }
      setUpiError('')
      return true
    }
    if (paymentMethod === 'CARD') {
      const errs: Record<string, string> = {}
      const rawCard = cardNumber.replace(/\s/g, '')
      if (rawCard.length < 15) errs.cardNumber = 'Enter a valid card number'
      if (!cardName.trim()) errs.cardName = 'Enter cardholder name'
      if (!/^\d{2}\/\d{2}$/.test(expiry)) {
        errs.expiry = 'Enter MM/YY'
      } else {
        const [mm, yy] = expiry.split('/').map(Number)
        const now = new Date()
        const exp = new Date(2000 + yy, mm - 1)
        if (mm < 1 || mm > 12) errs.expiry = 'Invalid month'
        else if (exp < new Date(now.getFullYear(), now.getMonth())) errs.expiry = 'Card is expired'
      }
      const cvvLen = cardType === 'amex' ? 4 : 3
      if (cvv.length < cvvLen) errs.cvv = `Enter ${cvvLen}-digit CVV`
      setCardErrors(errs)
      return Object.keys(errs).length === 0
    }
    return true
  }

  const onSubmit = async (formData: AddressForm) => {
    if (cartItems.length === 0) { toast({ title: 'Cart is empty', variant: 'destructive' }); return }
    if (!validatePayment()) return

    setLoading(true)

    let shippingAddress: AddressForm
    if (selectedAddress !== 'new') {
      const addr = savedAddresses.find((a) => a.id === selectedAddress)!
      shippingAddress = addr
    } else {
      shippingAddress = formData
    }

    const paymentDetails = paymentMethod === 'UPI' ? { upiId } : paymentMethod === 'CARD' ? { last4: cardNumber.replace(/\s/g, '').slice(-4), cardType } : undefined

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: cartItems.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        shippingAddress,
        paymentMethod,
        paymentDetails,
        couponCode: coupon?.code,
        useWallet,
      }),
    })

    setLoading(false)
    if (!res.ok) {
      const data = await res.json()
      toast({ title: 'Order failed', description: formatApiError(data.error), variant: 'destructive' })
      return
    }

    const order = await res.json()
    clearCart()
    sessionStorage.removeItem('coupon')
    window.dispatchEvent(new Event('cartUpdated'))
    router.push(`/order-confirmation/${order.id}`)
  }

  // Show loading while checking auth
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
        </main>
        <Footer />
      </div>
    )
  }

  // Show login prompt if unauthenticated (fallback before redirect fires)
  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-sm w-full mx-4">
            <CardContent className="pt-6 text-center space-y-4">
              <ShieldCheck className="h-12 w-12 mx-auto text-brand-primary" />
              <h2 className="text-xl font-bold">Login Required</h2>
              <p className="text-muted-foreground text-sm">You must be logged in to place an order.</p>
              <div className="flex flex-col gap-2">
                <Button asChild className="bg-brand-primary hover:bg-brand-primary/90 text-white">
                  <Link href="/login?redirect=/checkout">Login</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/signup">Create an Account</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  const cardTypeLabel: Record<CardType, string> = { visa: 'Visa', mastercard: 'Mastercard', rupay: 'RuPay', amex: 'Amex', unknown: '' }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Checkout</h1>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                {/* Address */}
                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" />Delivery Address</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    {savedAddresses.length > 0 && (
                      <RadioGroup value={selectedAddress} onValueChange={setSelectedAddress} className="space-y-3">
                        {savedAddresses.map((addr) => (
                          <div key={addr.id} className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${selectedAddress === addr.id ? 'border-brand-primary bg-brand-light/20' : ''}`}>
                            <RadioGroupItem value={addr.id} id={addr.id} className="mt-1" />
                            <Label htmlFor={addr.id} className="cursor-pointer flex-1">
                              <p className="font-medium">{addr.name} · {addr.phone}</p>
                              <p className="text-sm text-muted-foreground">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}, {addr.city}, {addr.state} - {addr.pincode}</p>
                              {addr.isDefault && <Badge variant="secondary" className="mt-1 text-xs">Default</Badge>}
                            </Label>
                          </div>
                        ))}
                        <div className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${selectedAddress === 'new' ? 'border-brand-primary' : ''}`}>
                          <RadioGroupItem value="new" id="new-addr" />
                          <Label htmlFor="new-addr" className="cursor-pointer">Add a new address</Label>
                        </div>
                      </RadioGroup>
                    )}

                    {(selectedAddress === 'new' || savedAddresses.length === 0) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                        <div className="space-y-1">
                          <Label htmlFor="name">Full Name</Label>
                          <Input id="name" {...register('name')} />
                          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="phone">Phone</Label>
                          <Input id="phone" {...register('phone')} />
                          {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
                        </div>
                        <div className="space-y-1 sm:col-span-2">
                          <Label htmlFor="line1">Address Line 1</Label>
                          <Input id="line1" {...register('line1')} placeholder="House/Flat no, Street" />
                          {errors.line1 && <p className="text-xs text-destructive">{errors.line1.message}</p>}
                        </div>
                        <div className="space-y-1 sm:col-span-2">
                          <Label htmlFor="line2">Address Line 2 (optional)</Label>
                          <Input id="line2" {...register('line2')} placeholder="Landmark, Area" />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="city">City</Label>
                          <Input id="city" {...register('city')} />
                          {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="state">State</Label>
                          <Select onValueChange={(v) => setValue('state', v)}>
                            <SelectTrigger id="state"><SelectValue placeholder="Select state" /></SelectTrigger>
                            <SelectContent>
                              {INDIAN_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          {errors.state && <p className="text-xs text-destructive">{errors.state.message}</p>}
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="pincode">Pincode</Label>
                          <Input id="pincode" {...register('pincode')} maxLength={6} />
                          {errors.pincode && <p className="text-xs text-destructive">{errors.pincode.message}</p>}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Payment */}
                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5" />Payment Method</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as 'COD' | 'UPI' | 'CARD')} className="space-y-3">
                      {[
                        { value: 'COD', label: 'Cash on Delivery', desc: 'Pay when your order arrives', icon: <Package className="h-4 w-4" /> },
                        { value: 'UPI', label: 'UPI Payment', desc: 'GPay, PhonePe, Paytm, BHIM & more', icon: <Smartphone className="h-4 w-4" /> },
                        { value: 'CARD', label: 'Credit / Debit Card', desc: 'Visa, Mastercard, RuPay, Amex', icon: <CreditCard className="h-4 w-4" /> },
                      ].map((opt) => (
                        <div key={opt.value} className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${paymentMethod === opt.value ? 'border-brand-primary bg-brand-light/20' : 'hover:bg-muted/40'}`}>
                          <RadioGroupItem value={opt.value} id={`pay-${opt.value}`} className="mt-1" />
                          <Label htmlFor={`pay-${opt.value}`} className="cursor-pointer flex items-center gap-2 flex-1">
                            <span className="text-brand-primary">{opt.icon}</span>
                            <span>
                              <p className="font-medium">{opt.label}</p>
                              <p className="text-xs text-muted-foreground">{opt.desc}</p>
                            </span>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>

                    {/* UPI fields */}
                    {paymentMethod === 'UPI' && (
                      <div className="mt-2 space-y-2 p-4 bg-muted/30 rounded-lg border">
                        <Label htmlFor="upi-id" className="font-medium">UPI ID</Label>
                        <Input
                          id="upi-id"
                          placeholder="yourname@okicici"
                          value={upiId}
                          onChange={(e) => { setUpiId(e.target.value); if (upiError) setUpiError('') }}
                          className={upiError ? 'border-destructive' : ''}
                        />
                        {upiError && <p className="text-xs text-destructive">{upiError}</p>}
                        <p className="text-xs text-muted-foreground">Format: username@bankcode (e.g. john@okaxis, 9876543210@paytm)</p>
                      </div>
                    )}

                    {/* Card fields */}
                    {paymentMethod === 'CARD' && (
                      <div className="mt-2 p-4 bg-muted/30 rounded-lg border space-y-3">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="card-number">Card Number</Label>
                            {cardType !== 'unknown' && (
                              <span className="text-xs font-semibold text-brand-primary">{cardTypeLabel[cardType]}</span>
                            )}
                          </div>
                          <Input
                            id="card-number"
                            placeholder="1234 5678 9012 3456"
                            value={cardNumber}
                            inputMode="numeric"
                            onChange={(e) => { setCardNumber(formatCardNumber(e.target.value)); setCardErrors((p) => ({ ...p, cardNumber: '' })) }}
                            className={cardErrors.cardNumber ? 'border-destructive font-mono tracking-widest' : 'font-mono tracking-widest'}
                            maxLength={19}
                          />
                          {cardErrors.cardNumber && <p className="text-xs text-destructive">{cardErrors.cardNumber}</p>}
                        </div>

                        <div className="space-y-1">
                          <Label htmlFor="card-name">Cardholder Name</Label>
                          <Input
                            id="card-name"
                            placeholder="Name on card"
                            value={cardName}
                            onChange={(e) => { setCardName(e.target.value.toUpperCase()); setCardErrors((p) => ({ ...p, cardName: '' })) }}
                            className={`uppercase ${cardErrors.cardName ? 'border-destructive' : ''}`}
                          />
                          {cardErrors.cardName && <p className="text-xs text-destructive">{cardErrors.cardName}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label htmlFor="expiry">Expiry Date</Label>
                            <Input
                              id="expiry"
                              placeholder="MM/YY"
                              value={expiry}
                              inputMode="numeric"
                              onChange={(e) => { setExpiry(formatExpiry(e.target.value)); setCardErrors((p) => ({ ...p, expiry: '' })) }}
                              className={cardErrors.expiry ? 'border-destructive' : ''}
                              maxLength={5}
                            />
                            {cardErrors.expiry && <p className="text-xs text-destructive">{cardErrors.expiry}</p>}
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="cvv">CVV</Label>
                            <Input
                              id="cvv"
                              placeholder={cardType === 'amex' ? '4 digits' : '3 digits'}
                              value={cvv}
                              inputMode="numeric"
                              type="password"
                              onChange={(e) => { setCvv(e.target.value.replace(/\D/g, '').slice(0, cardType === 'amex' ? 4 : 3)); setCardErrors((p) => ({ ...p, cvv: '' })) }}
                              className={cardErrors.cvv ? 'border-destructive' : ''}
                              maxLength={cardType === 'amex' ? 4 : 3}
                            />
                            {cardErrors.cvv && <p className="text-xs text-destructive">{cardErrors.cvv}</p>}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
                          <ShieldCheck className="h-3.5 w-3.5 text-green-600" />
                          <span>Your card details are encrypted and secure</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Summary */}
              <div>
                <Card className="sticky top-24">
                  <CardHeader><CardTitle className="flex items-center gap-2"><Package className="h-5 w-5" />Order Review</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {cartItems.map((item) => (
                        <div key={item.productId} className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded overflow-hidden bg-muted shrink-0">
                            <Image src={item.image || '/placeholder.jpg'} alt={item.name ?? ''} fill className="object-cover" sizes="48px" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium line-clamp-1">{item.name}</p>
                            <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                          </div>
                          <p className="text-xs font-semibold">₹{((item.price ?? 0) * item.quantity).toFixed(0)}</p>
                        </div>
                      ))}
                    </div>
                    {walletBalance > 0 && (
                      <div className="flex items-center justify-between p-3 bg-violet-50 dark:bg-violet-950/30 rounded-lg border border-violet-200 dark:border-violet-800">
                        <div className="flex items-center gap-2">
                          <Wallet className="h-4 w-4 text-violet-600" />
                          <div>
                            <p className="text-sm font-medium text-violet-800 dark:text-violet-300">Skin Wallet</p>
                            <p className="text-xs text-violet-600 dark:text-violet-400">₹{walletBalance.toFixed(0)} available</p>
                          </div>
                        </div>
                        <Switch checked={useWallet} onCheckedChange={setUseWallet} />
                      </div>
                    )}
                    <div className="border-t pt-3 space-y-1.5 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₹{subtotal}</span></div>
                      {discount > 0 && <div className="flex justify-between text-green-600"><span>Coupon</span><span>−₹{discount}</span></div>}
                      {walletDeduction > 0 && <div className="flex justify-between text-violet-600"><span>Skin Wallet</span><span>−₹{walletDeduction.toFixed(0)}</span></div>}
                      <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span className={shipping === 0 ? 'text-green-600' : ''}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
                      <div className="border-t pt-2 flex justify-between font-bold text-base">
                        <span>Total</span><span>₹{total.toFixed(0)}</span>
                      </div>
                    </div>
                    <Button type="submit" className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white" size="lg" disabled={loading}>
                      {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Placing Order…</> : `Pay ₹${total.toFixed(0)}`}
                    </Button>
                    <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1">
                      <ShieldCheck className="h-3 w-3 text-green-600" /> Secure checkout
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  )
}
