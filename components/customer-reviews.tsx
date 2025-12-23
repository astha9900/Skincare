import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const reviews = [
  {
    name: "Priya Sharma",
    rating: 5,
    comment: "Amazing products! My skin has never looked better. Fast delivery too!",
    initials: "PS",
  },
  {
    name: "Rahul Verma",
    rating: 5,
    comment: "Great variety of brands and genuine products. Highly recommended!",
    initials: "RV",
  },
  {
    name: "Ananya Desai",
    rating: 4,
    comment: "Love the Minimalist serum! Cleared my acne in just 2 weeks.",
    initials: "AD",
  },
]

export function CustomerReviews() {
  return (
    <section id="reviews" className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Customers Say</h2>
          <p className="text-muted-foreground text-lg">Real reviews from real customers</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {reviews.map((review) => (
            <Card key={review.name} className="bg-brand-light/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar>
                    <AvatarFallback className="bg-brand-primary text-white">{review.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{review.name}</p>
                    <div className="flex gap-0.5">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{review.comment}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
