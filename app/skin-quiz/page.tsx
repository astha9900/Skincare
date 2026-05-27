'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { ChevronLeft, CheckCircle, Share2 } from 'lucide-react'

// ─── Quiz data ────────────────────────────────────────────────────────────────

const SKIN_TYPES = [
  { value: 'oily', icon: '💧', label: 'Oily', desc: 'Shiny by midday, enlarged pores, frequent breakouts' },
  { value: 'dry', icon: '🌵', label: 'Dry', desc: 'Tight feeling, flaky patches, rough texture' },
  { value: 'combination', icon: '☯️', label: 'Combination', desc: 'Oily T-zone (nose, forehead), dry cheeks' },
  { value: 'sensitive', icon: '🌸', label: 'Sensitive', desc: 'Redness, stinging, reacts to products easily' },
  { value: 'normal', icon: '✨', label: 'Normal', desc: 'Balanced, no major concerns, minimal breakouts' },
]

const SKIN_CONCERNS = [
  { value: 'acne', label: 'Acne & breakouts', icon: '🎯' },
  { value: 'dark-spots', label: 'Dark spots & pigmentation', icon: '🔮' },
  { value: 'dullness', label: 'Dullness & uneven tone', icon: '😴' },
  { value: 'anti-aging', label: 'Fine lines & wrinkles', icon: '⏳' },
  { value: 'hydration', label: 'Dehydration & dryness', icon: '💧' },
  { value: 'pores', label: 'Large pores & texture', icon: '🔬' },
  { value: 'redness', label: 'Redness & sensitivity', icon: '🌡️' },
  { value: 'tan', label: 'Tan & sun damage', icon: '☀️' },
  { value: 'oily-skin', label: 'Excess oil & shine', icon: '✨' },
]

const HAIR_TYPES = [
  { value: 'straight', icon: '➡️', label: 'Straight', desc: 'Smooth, tends to get oily at roots quickly' },
  { value: 'wavy', icon: '〜', label: 'Wavy', desc: 'S-shaped waves, can get frizzy in humidity' },
  { value: 'curly', icon: '🌀', label: 'Curly', desc: 'Defined springy curls, prone to dryness' },
  { value: 'coily', icon: '🔁', label: 'Coily / Kinky', desc: 'Tight coils or zig-zag pattern, very dry' },
]

const HAIR_CONCERNS = [
  { value: 'hair-fall', label: 'Excessive hair fall', icon: '🍂' },
  { value: 'dandruff', label: 'Dandruff & itchy scalp', icon: '❄️' },
  { value: 'frizz', label: 'Frizz & flyaways', icon: '⚡' },
  { value: 'growth', label: 'Slow hair growth', icon: '🌱' },
  { value: 'damage', label: 'Heat & chemical damage', icon: '🔥' },
  { value: 'oily-scalp', label: 'Oily scalp', icon: '💦' },
  { value: 'dry-scalp', label: 'Dry, flaky scalp', icon: '🏜️' },
  { value: 'volume', label: 'Lack of volume', icon: '📊' },
]

const BODY_CONCERNS = [
  { value: 'dry-body', label: 'Very dry body skin', icon: '🏜️' },
  { value: 'body-tan', label: 'Body tan & dark patches', icon: '☀️' },
  { value: 'body-acne', label: 'Body acne (back, chest)', icon: '🎯' },
  { value: 'stretch-marks', label: 'Stretch marks', icon: '✏️' },
  { value: 'cellulite', label: 'Cellulite', icon: '🍊' },
  { value: 'rough-elbows', label: 'Rough elbows & knees', icon: '🪨' },
  { value: 'none', label: 'Just want soft skin', icon: '🌸' },
]

const AGE_RANGES = [
  { value: 'TEENS', label: 'Under 20', desc: 'Teen skin concerns' },
  { value: 'TWENTIES', label: '20s', desc: 'Prevention & balance' },
  { value: 'THIRTIES', label: '30s', desc: 'Early anti-aging' },
  { value: 'FORTIES', label: '40s', desc: 'Active anti-aging' },
  { value: 'FIFTIES_PLUS', label: '50+', desc: 'Mature skin care' },
]

const BUDGETS = [
  { value: 'BUDGET', label: 'Under ₹299', icon: '💚' },
  { value: 'MID', label: '₹300 – ₹799', icon: '💛' },
  { value: 'PREMIUM', label: '₹800 – ₹1999', icon: '🧡' },
  { value: 'LUXURY', label: '₹2000+', icon: '💜' },
]

const CONCERN_LABELS: Record<string, string> = {
  acne: 'Acne', 'dark-spots': 'Dark Spots', dullness: 'Dullness', 'anti-aging': 'Anti-aging',
  hydration: 'Hydration', pores: 'Pores', redness: 'Redness', tan: 'Tan',
  'oily-skin': 'Oily Skin', 'hair-fall': 'Hair Fall', dandruff: 'Dandruff', frizz: 'Frizz',
  growth: 'Growth', damage: 'Damage', 'oily-scalp': 'Oily Scalp', 'dry-scalp': 'Dry Scalp',
  volume: 'Volume', 'dry-body': 'Dry Body', 'body-tan': 'Body Tan', 'body-acne': 'Body Acne',
  'stretch-marks': 'Stretch Marks', cellulite: 'Cellulite', 'rough-elbows': 'Rough Elbows', none: 'Soft Skin',
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface QuizState {
  skin: { type: string | null; concerns: string[] }
  hair: { type: string | null; concerns: string[] }
  body: { concerns: string[] }
  age: string | null
  budget: string | null
}

const INITIAL: QuizState = {
  skin: { type: null, concerns: [] },
  hair: { type: null, concerns: [] },
  body: { concerns: [] },
  age: null,
  budget: null,
}

const TOTAL_STEPS = 7

// ─── Sub-components ───────────────────────────────────────────────────────────

function OptionCard({ icon, label, desc, selected, onClick }: {
  icon: string; label: string; desc: string; selected: boolean; onClick: () => void
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'border-2 rounded-xl p-4 cursor-pointer transition-all select-none',
        selected
          ? 'border-pink-500 bg-pink-50 dark:bg-pink-950/50 shadow-sm'
          : 'border-border hover:border-pink-300 dark:hover:border-pink-700'
      )}
    >
      <span className="text-3xl mb-2 block">{icon}</span>
      <p className="font-semibold text-sm">{label}</p>
      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{desc}</p>
    </div>
  )
}

function ConcernChip({ icon, label, selected, onClick, disabled }: {
  icon: string; label: string; selected: boolean; onClick: () => void; disabled: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled && !selected}
      className={cn(
        'px-4 py-2 rounded-full text-sm border-2 transition-all font-medium',
        selected
          ? 'bg-pink-500 text-white border-pink-500 shadow-sm'
          : disabled
          ? 'border-border text-muted-foreground opacity-40 cursor-not-allowed'
          : 'border-border hover:border-pink-300 dark:hover:border-pink-700'
      )}
    >
      {icon} {label}
    </button>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SkinQuizPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const [step, setStep] = useState(1)
  const [quiz, setQuiz] = useState<QuizState>(INITIAL)
  const [saving, setSaving] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const progress = (step / TOTAL_STEPS) * 100

  const toggleConcern = useCallback((field: 'skin' | 'hair' | 'body', value: string, max: number) => {
    setQuiz((q) => {
      const current = field === 'body' ? q.body.concerns : q[field].concerns
      const next = current.includes(value)
        ? current.filter((c) => c !== value)
        : current.length < max ? [...current, value] : current
      if (field === 'body') return { ...q, body: { concerns: next } }
      return { ...q, [field]: { ...q[field], concerns: next } }
    })
  }, [])

  const canNext = (): boolean => {
    if (step === 1) return !!quiz.skin.type
    if (step === 2) return quiz.skin.concerns.length > 0
    if (step === 3) return !!quiz.hair.type
    if (step === 4) return quiz.hair.concerns.length > 0
    if (step === 5) return quiz.body.concerns.length > 0
    if (step === 6) return !!quiz.age
    if (step === 7) return !!quiz.budget
    return true
  }

  const next = () => {
    if (step < TOTAL_STEPS) setStep((s) => s + 1)
    else handleSubmit()
  }

  const back = () => {
    if (step > 1) setStep((s) => s - 1)
  }

  const handleSubmit = async () => {
    setSaving(true)

    const payload = {
      skinType: quiz.skin.type?.toUpperCase() as 'OILY' | 'DRY' | 'COMBINATION' | 'SENSITIVE' | 'NORMAL' | undefined,
      skinConcerns: quiz.skin.concerns,
      hairType: quiz.hair.type?.toUpperCase() as 'STRAIGHT' | 'WAVY' | 'CURLY' | 'COILY' | undefined,
      hairConcerns: quiz.hair.concerns,
      bodyConcerns: quiz.body.concerns,
      age: quiz.age as 'TEENS' | 'TWENTIES' | 'THIRTIES' | 'FORTIES' | 'FIFTIES_PLUS' | undefined,
      budget: quiz.budget as 'BUDGET' | 'MID' | 'PREMIUM' | 'LUXURY' | undefined,
    }

    try {
      await fetch('/api/quiz/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    } catch {
      // proceed to results regardless
    }

    setSaving(false)
    setShowResults(true)
  }

  const handleShare = () => {
    const skin = SKIN_TYPES.find((s) => s.value === quiz.skin.type)?.label ?? ''
    const concerns = quiz.skin.concerns.map((c) => CONCERN_LABELS[c] ?? c).join(', ')
    const text = `I just found my perfect skincare routine on SkinGlow!\nMy profile: ${skin} skin${concerns ? ` · ${concerns}` : ''}\nTake the free quiz: skinglow.in/skin-quiz`

    if (navigator.share) {
      navigator.share({ title: 'My SkinGlow Profile', text })
    } else {
      navigator.clipboard.writeText(text)
      toast({ title: 'Copied to clipboard!' })
    }
  }

  // ─── Results view ────────────────────────────────────────────────────────────

  if (showResults) {
    const skinLabel = SKIN_TYPES.find((s) => s.value === quiz.skin.type)?.label ?? ''
    const hairLabel = HAIR_TYPES.find((h) => h.value === quiz.hair.type)?.label ?? ''
    const allConcerns = [...quiz.skin.concerns, ...quiz.hair.concerns, ...quiz.body.concerns]

    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50/50 to-background dark:from-pink-950/20 flex flex-col">
        <Header />
        <main className="flex-1 max-w-3xl mx-auto px-4 py-10 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center mb-8"
          >
            <div className="text-5xl mb-3">✨</div>
            <h1 className="text-2xl font-bold mb-2">Your personalised routine is ready!</h1>
            <p className="text-muted-foreground">
              Your skin profile is ready! Log in to save it and get personalised picks everywhere.
            </p>
          </motion.div>

          {/* Profile card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            id="share-card"
            className="bg-gradient-to-br from-pink-50 to-rose-100 dark:from-pink-950/40 dark:to-rose-950/40 border border-pink-200 dark:border-pink-800 rounded-2xl p-6 mb-6 text-center"
          >
            <p className="text-pink-600 dark:text-pink-400 font-semibold text-sm mb-2">My SkinGlow Profile ✨</p>
            <p className="text-xl font-bold mb-3">{skinLabel} skin · {hairLabel} hair</p>
            <div className="flex flex-wrap justify-center gap-2">
              {allConcerns.map((c) => (
                <span key={c} className="bg-white/70 dark:bg-black/20 px-3 py-1 rounded-full text-sm font-medium">
                  {CONCERN_LABELS[c] ?? c}
                </span>
              ))}
            </div>
            {quiz.budget && (
              <p className="text-xs text-pink-400 mt-3">
                Budget: {BUDGETS.find((b) => b.value === quiz.budget)?.label}
              </p>
            )}
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="flex flex-wrap gap-3 justify-center mb-8"
          >
            {!session && (
              <Button asChild className="bg-pink-500 hover:bg-pink-600 text-white">
                <Link href={`/signup?redirect=/skin-quiz`}>
                  <CheckCircle className="h-4 w-4 mr-2" />Save My Profile
                </Link>
              </Button>
            )}
            {session && (
              <Button asChild className="bg-brand-primary hover:bg-brand-primary/90 text-white">
                <Link href="/products">Browse Products</Link>
              </Button>
            )}
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />Share Results
            </Button>
            <Button variant="ghost" onClick={() => { setShowResults(false); setStep(1); setQuiz(INITIAL) }}>
              Retake Quiz
            </Button>
          </motion.div>

        </main>
        <Footer />
      </div>
    )
  }

  // ─── Quiz steps ──────────────────────────────────────────────────────────────

  const stepMeta: Record<number, { label: string; question: string; hint?: string }> = {
    1: { label: 'Skin type', question: "What's your skin type?" },
    2: { label: 'Skin concerns', question: 'What are your main skin concerns?', hint: 'Pick up to 3' },
    3: { label: 'Hair type', question: 'How would you describe your hair?' },
    4: { label: 'Hair concerns', question: "What's your biggest hair concern?", hint: 'Pick up to 2' },
    5: { label: 'Body care', question: 'Any body care concerns?', hint: 'Pick up to 2' },
    6: { label: 'Age range', question: 'What age range are you in?' },
    7: { label: 'Budget', question: "What's your skincare budget?" },
  }

  const meta = stepMeta[step]

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50/50 to-background dark:from-pink-950/20 flex flex-col">
      <Header />
      <main className="flex-1 max-w-2xl mx-auto px-4 py-8 w-full">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Step {step} of {TOTAL_STEPS}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-1.5" />
          <div className="flex gap-1 mt-2 flex-wrap">
            {Object.entries(stepMeta).map(([s, m]) => (
              <span
                key={s}
                className={cn(
                  'text-xs px-2 py-0.5 rounded-full transition-colors',
                  parseInt(s) < step ? 'bg-pink-100 text-pink-600 dark:bg-pink-900/40 dark:text-pink-400' :
                  parseInt(s) === step ? 'bg-pink-500 text-white' :
                  'text-muted-foreground'
                )}
              >
                {m.label}
              </span>
            ))}
          </div>
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold">{meta.question}</h2>
              {meta.hint && <p className="text-sm text-muted-foreground mt-1">{meta.hint}</p>}
            </div>

            {/* Step 1 — Skin Type */}
            {step === 1 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {SKIN_TYPES.map((opt) => (
                  <OptionCard
                    key={opt.value} {...opt}
                    selected={quiz.skin.type === opt.value}
                    onClick={() => setQuiz((q) => ({ ...q, skin: { ...q.skin, type: opt.value } }))}
                  />
                ))}
              </div>
            )}

            {/* Step 2 — Skin Concerns */}
            {step === 2 && (
              <div className="flex flex-wrap gap-2">
                {SKIN_CONCERNS.map((c) => (
                  <ConcernChip
                    key={c.value} {...c}
                    selected={quiz.skin.concerns.includes(c.value)}
                    disabled={quiz.skin.concerns.length >= 3}
                    onClick={() => toggleConcern('skin', c.value, 3)}
                  />
                ))}
              </div>
            )}

            {/* Step 3 — Hair Type */}
            {step === 3 && (
              <div className="grid grid-cols-2 gap-3">
                {HAIR_TYPES.map((opt) => (
                  <OptionCard
                    key={opt.value} {...opt}
                    selected={quiz.hair.type === opt.value}
                    onClick={() => setQuiz((q) => ({ ...q, hair: { ...q.hair, type: opt.value } }))}
                  />
                ))}
              </div>
            )}

            {/* Step 4 — Hair Concerns */}
            {step === 4 && (
              <div className="flex flex-wrap gap-2">
                {HAIR_CONCERNS.map((c) => (
                  <ConcernChip
                    key={c.value} {...c}
                    selected={quiz.hair.concerns.includes(c.value)}
                    disabled={quiz.hair.concerns.length >= 2}
                    onClick={() => toggleConcern('hair', c.value, 2)}
                  />
                ))}
              </div>
            )}

            {/* Step 5 — Body Concerns */}
            {step === 5 && (
              <div className="flex flex-wrap gap-2">
                {BODY_CONCERNS.map((c) => (
                  <ConcernChip
                    key={c.value} {...c}
                    selected={quiz.body.concerns.includes(c.value)}
                    disabled={quiz.body.concerns.length >= 2}
                    onClick={() => toggleConcern('body', c.value, 2)}
                  />
                ))}
              </div>
            )}

            {/* Step 6 — Age range */}
            {step === 6 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {AGE_RANGES.map((opt) => (
                  <div
                    key={opt.value}
                    onClick={() => setQuiz((q) => ({ ...q, age: opt.value }))}
                    className={cn(
                      'border-2 rounded-xl p-4 cursor-pointer transition-all select-none',
                      quiz.age === opt.value
                        ? 'border-pink-500 bg-pink-50 dark:bg-pink-950/50 shadow-sm'
                        : 'border-border hover:border-pink-300 dark:hover:border-pink-700'
                    )}
                  >
                    <p className="font-bold text-lg">{opt.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{opt.desc}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Step 7 — Budget */}
            {step === 7 && (
              <div className="grid grid-cols-2 gap-3">
                {BUDGETS.map((opt) => (
                  <div
                    key={opt.value}
                    onClick={() => setQuiz((q) => ({ ...q, budget: opt.value }))}
                    className={cn(
                      'border-2 rounded-xl p-4 cursor-pointer transition-all select-none',
                      quiz.budget === opt.value
                        ? 'border-pink-500 bg-pink-50 dark:bg-pink-950/50 shadow-sm'
                        : 'border-border hover:border-pink-300 dark:hover:border-pink-700'
                    )}
                  >
                    <span className="text-3xl mb-2 block">{opt.icon}</span>
                    <p className="font-semibold text-sm">{opt.label}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <Button
            variant="ghost"
            onClick={back}
            disabled={step === 1}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />Back
          </Button>
          <Button
            onClick={next}
            disabled={!canNext() || saving}
            className="bg-pink-500 hover:bg-pink-600 text-white px-8"
          >
            {saving ? 'Finding matches…' : step === TOTAL_STEPS ? 'Get My Routine ✨' : 'Next →'}
          </Button>
        </div>

        {/* Guest note */}
        {!session && step === TOTAL_STEPS && (
          <p className="text-center text-xs text-muted-foreground mt-4">
            Results shown without saving.{' '}
            <Link href="/login?redirect=/skin-quiz" className="underline text-pink-500">Log in</Link>
            {' '}to save your profile for personalised picks every time.
          </p>
        )}
      </main>
      <Footer />
    </div>
  )
}
