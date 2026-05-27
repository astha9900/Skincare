import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="min-h-screen">
      <div className="h-16 border-b bg-background" />
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          <aside className="space-y-4">
            <Skeleton className="h-6 w-24" />
            <div className="space-y-2">{Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-5 w-full" />)}</div>
          </aside>
          <div className="lg:col-span-3">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {Array(9).fill(0).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="aspect-square w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-9 w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
