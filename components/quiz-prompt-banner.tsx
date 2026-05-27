import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'

export function QuizPromptBanner() {
  return (
    <section className="py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-500 to-rose-500 dark:from-pink-700 dark:to-rose-700 p-8 md:p-12 text-white">
          {/* decorative blobs */}
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/10 blur-2xl" />

          <div className="relative flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                <Sparkles className="h-5 w-5" />
                <span className="text-sm font-medium opacity-90">Personalised for you</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Not sure what to buy?</h2>
              <p className="text-white/80 mb-4">
                Take our 2-minute skin quiz — get personalised product picks from 300+ products
              </p>
              <p className="text-xs text-white/60">50,000+ people have found their perfect routine</p>

              {/* Blurred preview cards */}
              <div className="flex gap-2 mt-4 justify-center md:justify-start">
                {['🧴', '💧', '✨'].map((icon, i) => (
                  <div key={i} className="w-14 h-14 rounded-lg bg-white/20 flex items-center justify-center text-2xl blur-[1px] select-none">
                    {icon}
                  </div>
                ))}
                <div className="w-14 h-14 rounded-lg bg-white/10 flex items-center justify-center text-xs text-white/60 font-medium">
                  +more
                </div>
              </div>
            </div>

            <div className="shrink-0 text-center">
              <Button
                asChild
                size="lg"
                className="bg-white text-pink-600 hover:bg-pink-50 font-semibold shadow-lg"
              >
                <Link href="/skin-quiz">Take Free Quiz →</Link>
              </Button>
              <p className="text-xs text-white/60 mt-2">No account required</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
