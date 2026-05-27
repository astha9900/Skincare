'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { formatApiError } from '@/lib/utils'
import { Loader2, User, MapPin, Lock, Plus, Wallet, ArrowDownLeft, ArrowUpRight, Sparkles, Gift, Copy, Check, CreditCard, Smartphone } from 'lucide-react'
import Link from 'next/link'
import { SKIN_TYPE_LABELS, HAIR_TYPE_LABELS, BUDGET_LABELS } from '@/lib/quiz-engine'

const INDIAN_STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh','Puducherry','Chandigarh','Andaman & Nicobar']

const EMPTY_ADDR = { name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '', isDefault: false }

interface UserProfile { id: string; name: string; email: string; phone?: string; avatar?: string; role: string; createdAt: string }
interface WalletTx { id: string; amount: number; type: string; description: string; createdAt: string }
interface WalletData { balance: number; transactions: WalletTx[] | null }
interface Address { id: string; name: string; phone: string; line1: string; line2?: string; city: string; state: string; pincode: string; isDefault: boolean }
interface SkinProfile { skinType: string | null; skinConcerns: string[] | null; hairType: string | null; hairConcerns: string[] | null; bodyConcerns: string[] | null; budget: string | null; completedAt: string }
interface ReferralData { code: string; referralCount: number; totalEarned: number; walletBalance: number }

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [curPw, setCurPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [addrDialogOpen, setAddrDialogOpen] = useState(false)
  const [addrSaving, setAddrSaving] = useState(false)
  const [addrForm, setAddrForm] = useState(EMPTY_ADDR)
  const [wallet, setWallet] = useState<WalletData | null>(null)
  const [skinProfile, setSkinProfile] = useState<SkinProfile | null | undefined>(undefined)
  const [retakingQuiz, setRetakingQuiz] = useState(false)
  const [referral, setReferral] = useState<ReferralData | null>(null)
  const [addMoneyOpen, setAddMoneyOpen] = useState(false)
  const [addAmount, setAddAmount] = useState('')
  const [addingMoney, setAddingMoney] = useState(false)
  const [codeCopied, setCodeCopied] = useState(false)
  const [payMethod, setPayMethod] = useState<'upi' | 'card'>('upi')
  const [upiId, setUpiId] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [cardName, setCardName] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login?redirect=/profile')
    if (status === 'authenticated') {
      fetch('/api/users/profile').then((r) => r.json()).then((data) => {
        setProfile(data); setName(data.name ?? ''); setPhone(data.phone ?? '')
      })
      fetch('/api/users/addresses').then((r) => r.json()).then((data) => Array.isArray(data) && setAddresses(data))
      fetch('/api/users/wallet').then((r) => r.json()).then((data) => data && setWallet(data))
      fetch('/api/users/referral').then((r) => r.json()).then((data) => { if (data && !data.error) setReferral(data) })
      fetch('/api/quiz/save').then((r) => r.json()).then((data) => setSkinProfile(data ?? null))
    }
  }, [status, router])

  const retakeQuiz = async () => {
    setRetakingQuiz(true)
    await fetch('/api/quiz/retake', { method: 'DELETE' })
    setRetakingQuiz(false)
    setSkinProfile(null)
    toast({ title: 'Quiz cleared', description: 'Take the quiz again to update your recommendations.' })
    router.push('/skin-quiz')
  }

  const resetAddMoneyForm = () => {
    setAddAmount('')
    setUpiId('')
    setCardNumber('')
    setCardName('')
    setCardExpiry('')
    setCardCvv('')
    setPayMethod('upi')
  }

  const addMoney = async (e: React.FormEvent) => {
    e.preventDefault()
    const amount = parseInt(addAmount)
    if (!amount || amount < 10) { toast({ title: 'Minimum ₹10', variant: 'destructive' }); return }
    if (payMethod === 'upi' && !upiId.trim()) { toast({ title: 'Enter UPI ID', variant: 'destructive' }); return }
    if (payMethod === 'card' && (!cardNumber || !cardName || !cardExpiry || !cardCvv)) {
      toast({ title: 'Fill all card details', variant: 'destructive' }); return
    }
    setAddingMoney(true)
    const res = await fetch('/api/users/wallet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    })
    const data = await res.json()
    setAddingMoney(false)
    if (res.ok) {
      setWallet(data)
      setAddMoneyOpen(false)
      resetAddMoneyForm()
      toast({ title: `₹${amount} added!`, description: 'Your Skin Wallet has been topped up.' })
    } else {
      toast({ title: 'Failed', description: formatApiError(data.error), variant: 'destructive' })
    }
  }

  const copyReferralCode = () => {
    if (!referral?.code) return
    const link = `${window.location.origin}/signup?ref=${referral.code}`
    navigator.clipboard.writeText(link)
    setCodeCopied(true)
    setTimeout(() => setCodeCopied(false), 2000)
    toast({ title: 'Link copied!', description: 'Share it with friends to earn ₹100 each.' })
  }

  const saveProfile = async () => {
    setSaving(true)
    const res = await fetch('/api/users/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, phone }) })
    setSaving(false)
    if (res.ok) toast({ title: 'Profile updated' })
    else toast({ title: 'Failed to update', variant: 'destructive' })
  }

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPw !== confirmPw) { toast({ title: 'Passwords do not match', variant: 'destructive' }); return }
    setSaving(true)
    const res = await fetch('/api/users/change-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currentPassword: curPw, newPassword: newPw }) })
    const data = await res.json()
    setSaving(false)
    if (res.ok) { toast({ title: 'Password changed' }); setCurPw(''); setNewPw(''); setConfirmPw('') }
    else toast({ title: 'Failed to change password', description: formatApiError(data.error), variant: 'destructive' })
  }

  const deleteAddress = async (id: string) => {
    const res = await fetch(`/api/users/addresses/${id}`, { method: 'DELETE' })
    if (res.ok) setAddresses((prev) => prev.filter((a) => a.id !== id))
    else toast({ title: 'Cannot delete', variant: 'destructive' })
  }

  const setDefault = async (id: string) => {
    await fetch(`/api/users/addresses/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isDefault: true }) })
    setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })))
  }

  const addAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddrSaving(true)
    const res = await fetch('/api/users/addresses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...addrForm, line2: addrForm.line2 || undefined }),
    })
    const data = await res.json()
    setAddrSaving(false)
    if (res.ok) {
      setAddresses((prev) => addrForm.isDefault ? [...prev.map((a) => ({ ...a, isDefault: false })), data] : [...prev, data])
      setAddrDialogOpen(false)
      setAddrForm(EMPTY_ADDR)
      toast({ title: 'Address saved' })
    } else {
      toast({ title: 'Failed to save', description: formatApiError(data.error), variant: 'destructive' })
    }
  }

  if (!profile) return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></main>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-16 w-16 rounded-full bg-brand-primary flex items-center justify-center text-2xl font-bold text-white">
              {profile.name[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{profile.name}</h1>
              <p className="text-muted-foreground text-sm">{profile.email}</p>
              <Badge variant="secondary" className="mt-1 text-xs capitalize">{profile.role.toLowerCase()}</Badge>
            </div>
          </div>

          <Tabs defaultValue="profile">
            <TabsList className="w-full mb-6 flex flex-wrap h-auto gap-1">
              <TabsTrigger value="profile" className="flex-1 min-w-fit"><User className="h-4 w-4 mr-1 hidden sm:block" />Profile</TabsTrigger>
              <TabsTrigger value="skin-profile" className="flex-1 min-w-fit"><Sparkles className="h-4 w-4 mr-1 hidden sm:block" />Skin Profile</TabsTrigger>
              <TabsTrigger value="addresses" className="flex-1 min-w-fit"><MapPin className="h-4 w-4 mr-1 hidden sm:block" />Addresses</TabsTrigger>
              <TabsTrigger value="wallet" className="flex-1 min-w-fit"><Wallet className="h-4 w-4 mr-1 hidden sm:block" />Wallet</TabsTrigger>
              <TabsTrigger value="referral" className="flex-1 min-w-fit"><Gift className="h-4 w-4 mr-1 hidden sm:block" />Referral</TabsTrigger>
              <TabsTrigger value="security" className="flex-1 min-w-fit"><Lock className="h-4 w-4 mr-1 hidden sm:block" />Security</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card>
                <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="p-name">Full Name</Label>
                    <Input id="p-name" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="p-email">Email</Label>
                    <Input id="p-email" value={profile.email} disabled className="opacity-60" />
                    <p className="text-xs text-muted-foreground">Contact support to change email</p>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="p-phone">Phone</Label>
                    <Input id="p-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91-XXXXXXXXXX" />
                  </div>
                  <Button onClick={saveProfile} className="bg-brand-primary hover:bg-brand-primary/90 text-white" disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Save Changes
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="skin-profile">
              {skinProfile === undefined ? (
                <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
              ) : skinProfile === null ? (
                <div className="text-center py-12">
                  <p className="text-5xl mb-4">🧴</p>
                  <h3 className="font-semibold text-lg mb-2">No skin profile yet</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Take a 2-minute quiz to get personalised skincare recommendations
                  </p>
                  <Button asChild className="bg-pink-500 hover:bg-pink-600 text-white">
                    <Link href="/skin-quiz">Take the Free Skin Quiz →</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">Your Skin Profile</h3>
                      <p className="text-sm text-muted-foreground">
                        Completed {new Date(skinProfile.completedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={retakeQuiz} disabled={retakingQuiz}>
                      {retakingQuiz ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                      Retake Quiz
                    </Button>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Skin Type', value: skinProfile.skinType ? (SKIN_TYPE_LABELS[skinProfile.skinType] ?? skinProfile.skinType) : '—', icon: '✨' },
                      { label: 'Hair Type', value: skinProfile.hairType ? (HAIR_TYPE_LABELS[skinProfile.hairType] ?? skinProfile.hairType) : '—', icon: '💆' },
                      { label: 'Budget', value: skinProfile.budget ? (BUDGET_LABELS[skinProfile.budget] ?? skinProfile.budget) : '—', icon: '💳' },
                    ].map(({ label, value, icon }) => (
                      <Card key={label}>
                        <CardContent className="p-3 text-center">
                          <p className="text-2xl mb-1">{icon}</p>
                          <p className="text-xs text-muted-foreground">{label}</p>
                          <p className="text-sm font-semibold mt-0.5 leading-tight">{value}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {(skinProfile.skinConcerns ?? []).length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Skin Concerns</p>
                      <div className="flex flex-wrap gap-2">
                        {(skinProfile.skinConcerns ?? []).map((c) => (
                          <Badge key={c} className="bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300 border-0 capitalize">{c.replace(/-/g, ' ')}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {(skinProfile.hairConcerns ?? []).length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Hair Concerns</p>
                      <div className="flex flex-wrap gap-2">
                        {(skinProfile.hairConcerns ?? []).map((c) => (
                          <Badge key={c} variant="outline" className="capitalize">{c.replace(/-/g, ' ')}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {(skinProfile.bodyConcerns ?? []).length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Body Concerns</p>
                      <div className="flex flex-wrap gap-2">
                        {(skinProfile.bodyConcerns ?? []).map((c) => (
                          <Badge key={c} variant="secondary" className="capitalize">{c.replace(/-/g, ' ')}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button asChild className="w-full bg-pink-500 hover:bg-pink-600 text-white">
                    <Link href="/products?recommended=true">
                      <Sparkles className="h-4 w-4 mr-2" />View My Recommendations
                    </Link>
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="addresses">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">{addresses.length}/5 addresses saved</p>
                  <Button size="sm" className="bg-brand-primary hover:bg-brand-primary/90 text-white"
                    onClick={() => { setAddrForm(EMPTY_ADDR); setAddrDialogOpen(true) }}
                    disabled={addresses.length >= 5}>
                    <Plus className="h-4 w-4 mr-1" />Add Address
                  </Button>
                </div>
                {addresses.map((addr) => (
                  <Card key={addr.id}>
                    <CardContent className="p-4 flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{addr.name}</p>
                          {addr.isDefault && <Badge variant="secondary" className="text-xs">Default</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">{addr.phone}</p>
                        <p className="text-sm text-muted-foreground">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
                        <p className="text-sm text-muted-foreground">{addr.city}, {addr.state} - {addr.pincode}</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        {!addr.isDefault && <Button size="sm" variant="outline" onClick={() => setDefault(addr.id)}>Set Default</Button>}
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteAddress(addr.id)}>Delete</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {addresses.length === 0 && <p className="text-center text-muted-foreground py-8">No saved addresses. Add one to speed up checkout.</p>}
              </div>

              <Dialog open={addrDialogOpen} onOpenChange={setAddrDialogOpen}>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                  <DialogHeader><DialogTitle>Add New Address</DialogTitle></DialogHeader>
                  <form onSubmit={addAddress} className="space-y-3 py-2">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2 space-y-1">
                        <Label>Full Name *</Label>
                        <Input value={addrForm.name} onChange={(e) => setAddrForm((f) => ({ ...f, name: e.target.value }))} required />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <Label>Phone *</Label>
                        <Input value={addrForm.phone} onChange={(e) => setAddrForm((f) => ({ ...f, phone: e.target.value }))} placeholder="10-digit mobile number" required />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <Label>Address Line 1 *</Label>
                        <Input value={addrForm.line1} onChange={(e) => setAddrForm((f) => ({ ...f, line1: e.target.value }))} placeholder="House/Flat no., Street" required />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <Label>Address Line 2</Label>
                        <Input value={addrForm.line2} onChange={(e) => setAddrForm((f) => ({ ...f, line2: e.target.value }))} placeholder="Landmark, Area (optional)" />
                      </div>
                      <div className="space-y-1">
                        <Label>City *</Label>
                        <Input value={addrForm.city} onChange={(e) => setAddrForm((f) => ({ ...f, city: e.target.value }))} required />
                      </div>
                      <div className="space-y-1">
                        <Label>Pincode *</Label>
                        <Input value={addrForm.pincode} onChange={(e) => setAddrForm((f) => ({ ...f, pincode: e.target.value }))} maxLength={6} placeholder="6-digit pincode" required />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <Label>State *</Label>
                        <Select value={addrForm.state} onValueChange={(v) => setAddrForm((f) => ({ ...f, state: v }))}>
                          <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                          <SelectContent className="max-h-60">
                            {INDIAN_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2 flex items-center gap-3">
                        <Switch id="addr-default" checked={addrForm.isDefault}
                          onCheckedChange={(v) => setAddrForm((f) => ({ ...f, isDefault: v }))} />
                        <Label htmlFor="addr-default">Set as default address</Label>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button type="submit" className="flex-1 bg-brand-primary hover:bg-brand-primary/90 text-white" disabled={addrSaving}>
                        {addrSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Save Address
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setAddrDialogOpen(false)}>Cancel</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </TabsContent>

            <TabsContent value="security">
              <Card>
                <CardHeader><CardTitle>Change Password</CardTitle></CardHeader>
                <CardContent>
                  <form onSubmit={changePassword} className="space-y-4">
                    <div className="space-y-1">
                      <Label htmlFor="cur-pw">Current Password</Label>
                      <Input id="cur-pw" type="password" value={curPw} onChange={(e) => setCurPw(e.target.value)} required />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="new-pw">New Password</Label>
                      <Input id="new-pw" type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} required minLength={8} />
                      <p className="text-xs text-muted-foreground">Min 8 characters, must include a number</p>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="confirm-pw">Confirm New Password</Label>
                      <Input id="confirm-pw" type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} required />
                    </div>
                    <Button type="submit" className="bg-brand-primary hover:bg-brand-primary/90 text-white" disabled={saving}>
                      {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Update Password
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="wallet">
              <div className="space-y-4">
                {/* Balance card */}
                <Card className="bg-gradient-to-br from-brand-primary to-[#2d7a4e] text-white">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Wallet className="h-5 w-5 opacity-80" />
                          <span className="text-sm opacity-80">Skin Wallet Balance</span>
                        </div>
                        <p className="text-4xl font-bold">₹{(wallet?.balance ?? 0).toLocaleString('en-IN')}</p>
                        <p className="text-xs opacity-70 mt-2">Use at checkout · Refunds credited here automatically</p>
                      </div>
                      <Button
                        onClick={() => setAddMoneyOpen(true)}
                        className="bg-white/20 hover:bg-white/30 text-white border border-white/30 shrink-0"
                        size="sm"
                      >
                        <Plus className="h-4 w-4 mr-1" />Add Money
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Transactions */}
                <Card>
                  <CardHeader><CardTitle className="text-base">Transaction History</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    {!wallet || (wallet.transactions ?? []).length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-6">No transactions yet.</p>
                    ) : (
                      (wallet.transactions ?? []).map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between py-2 border-b last:border-0">
                          <div className="flex items-center gap-3">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                              tx.amount > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {tx.amount > 0 ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{tx.description}</p>
                              <p className="text-xs text-muted-foreground">{new Date(tx.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                            </div>
                          </div>
                          <span className={`font-semibold text-sm shrink-0 ml-2 ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {tx.amount > 0 ? '+' : ''}₹{Math.abs(tx.amount).toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Add Money Dialog */}
              <Dialog open={addMoneyOpen} onOpenChange={(open) => { setAddMoneyOpen(open); if (!open) resetAddMoneyForm() }}>
                <DialogContent className="max-w-sm">
                  <DialogHeader><DialogTitle>Add Money to Skin Wallet</DialogTitle></DialogHeader>
                  <form onSubmit={addMoney} className="space-y-4">
                    {/* Amount selection */}
                    <div className="grid grid-cols-4 gap-2">
                      {[100, 200, 500, 1000].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setAddAmount(String(amt))}
                          className={`py-2 rounded-lg border text-sm font-semibold transition-colors ${
                            addAmount === String(amt)
                              ? 'bg-brand-primary text-white border-brand-primary'
                              : 'border-border hover:border-brand-primary'
                          }`}
                        >
                          ₹{amt}
                        </button>
                      ))}
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="add-amount">Custom Amount</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₹</span>
                        <Input
                          id="add-amount"
                          type="number"
                          min={10}
                          max={10000}
                          value={addAmount}
                          onChange={(e) => setAddAmount(e.target.value)}
                          className="pl-7"
                          placeholder="Enter amount"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Min ₹10 · Max ₹10,000</p>
                    </div>

                    {/* Payment method selector */}
                    <div className="space-y-3">
                      <Label>Payment Method</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setPayMethod('upi')}
                          className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 text-sm font-medium transition-colors ${
                            payMethod === 'upi'
                              ? 'border-brand-primary bg-brand-primary/5 text-brand-primary'
                              : 'border-border hover:border-brand-primary/50'
                          }`}
                        >
                          <Smartphone className="h-4 w-4" />UPI
                        </button>
                        <button
                          type="button"
                          onClick={() => setPayMethod('card')}
                          className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 text-sm font-medium transition-colors ${
                            payMethod === 'card'
                              ? 'border-brand-primary bg-brand-primary/5 text-brand-primary'
                              : 'border-border hover:border-brand-primary/50'
                          }`}
                        >
                          <CreditCard className="h-4 w-4" />Card
                        </button>
                      </div>

                      {payMethod === 'upi' && (
                        <div className="space-y-1">
                          <Label htmlFor="upi-id">UPI ID</Label>
                          <Input
                            id="upi-id"
                            placeholder="yourname@paytm"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                          />
                          <p className="text-xs text-muted-foreground">e.g. mobile@upi, name@paytm, name@gpay</p>
                        </div>
                      )}

                      {payMethod === 'card' && (
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <Label htmlFor="card-number">Card Number</Label>
                            <Input
                              id="card-number"
                              placeholder="1234 5678 9012 3456"
                              maxLength={19}
                              value={cardNumber}
                              onChange={(e) => {
                                const v = e.target.value.replace(/\D/g, '').slice(0, 16)
                                setCardNumber(v.replace(/(.{4})/g, '$1 ').trim())
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="card-name">Cardholder Name</Label>
                            <Input
                              id="card-name"
                              placeholder="As on card"
                              value={cardName}
                              onChange={(e) => setCardName(e.target.value.toUpperCase())}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label htmlFor="card-expiry">Expiry (MM/YY)</Label>
                              <Input
                                id="card-expiry"
                                placeholder="MM/YY"
                                maxLength={5}
                                value={cardExpiry}
                                onChange={(e) => {
                                  const v = e.target.value.replace(/\D/g, '').slice(0, 4)
                                  setCardExpiry(v.length > 2 ? `${v.slice(0, 2)}/${v.slice(2)}` : v)
                                }}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor="card-cvv">CVV</Label>
                              <Input
                                id="card-cvv"
                                placeholder="•••"
                                type="password"
                                maxLength={4}
                                value={cardCvv}
                                onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1 bg-brand-primary hover:bg-brand-primary/90 text-white" disabled={addingMoney}>
                        {addingMoney ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Pay ₹{addAmount || '0'}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => { setAddMoneyOpen(false); resetAddMoneyForm() }}>Cancel</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </TabsContent>

            <TabsContent value="referral">
              <div className="space-y-4">
                {/* Header card */}
                <Card className="bg-gradient-to-br from-pink-500 to-rose-500 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Gift className="h-5 w-5 opacity-80" />
                      <span className="text-sm opacity-80">Referral Program</span>
                    </div>
                    <p className="text-2xl font-bold mb-1">Earn ₹100 per friend</p>
                    <p className="text-sm opacity-80">You and your friend both get ₹100 in Skin Wallet when they sign up with your code</p>
                  </CardContent>
                </Card>

                {/* Stats */}
                {referral && (
                  <div className="grid grid-cols-2 gap-3">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <p className="text-3xl font-bold text-pink-500">{referral.referralCount}</p>
                        <p className="text-xs text-muted-foreground mt-1">Friends Referred</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <p className="text-3xl font-bold text-green-600">₹{referral.totalEarned}</p>
                        <p className="text-xs text-muted-foreground mt-1">Total Earned</p>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Referral code */}
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <p className="text-sm font-medium">Your Referral Code</p>
                    {referral ? (
                      <>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-muted rounded-lg px-4 py-3 font-mono font-bold text-lg tracking-widest text-center">
                            {referral.code}
                          </div>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={copyReferralCode}
                            className={codeCopied ? 'border-green-500 text-green-600' : ''}
                          >
                            {codeCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                        <Button
                          onClick={copyReferralCode}
                          className="w-full bg-pink-500 hover:bg-pink-600 text-white"
                        >
                          <Gift className="h-4 w-4 mr-2" />
                          {codeCopied ? 'Link Copied! ✓' : 'Copy Referral Link'}
                        </Button>
                        <p className="text-xs text-muted-foreground text-center">
                          Share your link — both you and your friend get ₹100 instantly on signup
                        </p>
                      </>
                    ) : (
                      <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin" /></div>
                    )}
                  </CardContent>
                </Card>

                {/* How it works */}
                <Card>
                  <CardHeader><CardTitle className="text-sm">How it works</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { step: '1', text: 'Copy your unique referral link above' },
                      { step: '2', text: 'Share it with friends via WhatsApp, Instagram, or SMS' },
                      { step: '3', text: 'Friend signs up using your link' },
                      { step: '4', text: 'Both of you get ₹100 credited to Skin Wallet instantly' },
                    ].map(({ step, text }) => (
                      <div key={step} className="flex items-center gap-3">
                        <div className="h-7 w-7 rounded-full bg-pink-100 text-pink-600 dark:bg-pink-900/40 dark:text-pink-400 flex items-center justify-center text-xs font-bold shrink-0">
                          {step}
                        </div>
                        <p className="text-sm">{text}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  )
}
