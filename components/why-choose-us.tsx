import { Shield, Truck, Heart, Award } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const features = [
  {
    icon: Shield,
    title: "Authentic Products",
    description: "100% genuine products from verified brands",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    description: "Quick delivery across India",
  },
  {
    icon: Heart,
    title: "Trusted by Thousands",
    description: "Over 50,000+ happy customers",
  },
  {
    icon: Award,
    title: "Best Prices",
    description: "Competitive prices with great discounts",
  },
]

export function WhyChooseUs() {
  return (
    <section id="why-choose" className="py-16 bg-gradient-to-b from-brand-light/30 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Us</h2>
          <p className="text-muted-foreground text-lg">Your skin deserves the best</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} className="border-brand-primary/20">
              <CardContent className="pt-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-primary/10 mb-4">
                  <feature.icon className="h-6 w-6 text-brand-primary" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
