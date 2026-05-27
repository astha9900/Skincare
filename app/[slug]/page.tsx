import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { infoPageMap, infoPages } from '@/lib/info-pages'

type Props = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return infoPages.map((page) => ({ slug: page.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = infoPageMap.get(slug)

  if (!page) return {}

  return {
    title: page.title,
    description: page.description,
  }
}

export default async function InfoPage({ params }: Props) {
  const { slug } = await params
  const page = infoPageMap.get(slug)

  if (!page) notFound()

  const related = infoPages
    .filter((item) => item.slug !== page.slug && item.eyebrow === page.eyebrow)
    .slice(0, 3)

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="border-b bg-[#f4fbf6] dark:bg-[#0c1710]">
          <div className="container mx-auto max-w-5xl px-4 py-14">
            <p className="text-sm font-semibold text-brand-primary">{page.eyebrow}</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-tight md:text-5xl">{page.title}</h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">{page.description}</p>
            {page.cta && (
              <Button asChild className="mt-8 bg-brand-primary hover:bg-brand-primary/90 text-white">
                <Link href={page.cta.href}>
                  {page.cta.label} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </section>

        <section className="container mx-auto max-w-5xl px-4 py-12">
          <div className="grid gap-5 md:grid-cols-3">
            {page.sections.map((section) => (
              <article key={section.title} className="rounded-lg border bg-background p-6">
                <h2 className="text-lg font-semibold">{section.title}</h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{section.body}</p>
                {section.items && (
                  <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
                    {section.items.map((item) => (
                      <li key={item} className="flex gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </div>

          {related.length > 0 && (
            <div className="mt-12 rounded-lg border bg-muted/35 p-6">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-brand-primary">Related Pages</p>
                  <h2 className="mt-1 text-2xl font-bold">Keep exploring SkinGlow</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {related.map((item) => (
                    <Button key={item.slug} asChild variant="outline">
                      <Link href={`/${item.slug}`}>{item.title}</Link>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  )
}
