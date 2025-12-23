import { Hero } from "@/components/hero"
import { FeaturedProducts } from "@/components/featured-products"
import { Categories } from "@/components/categories"
import { WhyChooseUs } from "@/components/why-choose-us"
import { CustomerReviews } from "@/components/customer-reviews"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <Categories />
        <FeaturedProducts />
        <WhyChooseUs />
        <CustomerReviews />
      </main>
      <Footer />
    </div>
  )
}
