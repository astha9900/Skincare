import { Mail, Phone, Instagram, Twitter, Facebook } from "lucide-react"
import Link from "next/link"
import { SkinGlowLogo } from "@/components/logo"

export function Footer() {
  return (
    <footer className="bg-muted/50 border-t mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <SkinGlowLogo size={30} />
              <span className="text-lg font-bold tracking-tight">
                <span className="text-[#1a5436] dark:text-[#5bb87e]">Skin</span>
                <span className="text-[#2d7a4e] dark:text-[#7ddba5]">Glow</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs leading-6">
              Your trusted multi-vendor skincare marketplace. Discover expert-curated products for every skin type and concern.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a href="#" aria-label="Instagram" className="h-8 w-8 rounded-full bg-muted flex items-center justify-center hover:bg-brand-primary hover:text-white transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" aria-label="Twitter" className="h-8 w-8 rounded-full bg-muted flex items-center justify-center hover:bg-brand-primary hover:text-white transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" aria-label="Facebook" className="h-8 w-8 rounded-full bg-muted flex items-center justify-center hover:bg-brand-primary hover:text-white transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-semibold mb-4">Shop</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link href="/products" className="hover:text-foreground transition-colors">All Products</Link></li>
              <li><Link href="/skin-quiz" className="hover:text-foreground transition-colors">✨ Skin Quiz</Link></li>
              <li><Link href="/brands" className="hover:text-foreground transition-colors">Brands</Link></li>
              <li><Link href="/search" className="hover:text-foreground transition-colors">Search</Link></li>
              <li><Link href="/skin-guide" className="hover:text-foreground transition-colors">Skin Guide</Link></li>
              <li><Link href="/cart" className="hover:text-foreground transition-colors">Cart</Link></li>
              <li><Link href="/wishlist" className="hover:text-foreground transition-colors">Wishlist</Link></li>
            </ul>
          </div>

          {/* Account & Support */}
          <div>
            <h4 className="font-semibold mb-4">Account</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link href="/profile" className="hover:text-foreground transition-colors">My Profile</Link></li>
              <li><Link href="/my-orders" className="hover:text-foreground transition-colors">My Orders</Link></li>
              <li><Link href="/login" className="hover:text-foreground transition-colors">Login</Link></li>
              <li><Link href="/signup" className="hover:text-foreground transition-colors">Sign Up</Link></li>
              <li><Link href="/shipping-returns" className="hover:text-foreground transition-colors">Shipping & Returns</Link></li>
              <li><Link href="/contact" className="hover:text-foreground transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Mail className="h-4 w-4 mt-0.5 shrink-0" />
                <a href="mailto:singhastha614@gmail.com" className="hover:text-foreground transition-colors break-all">
                  singhastha614@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" />
                <a href="tel:+919661644321" className="hover:text-foreground transition-colors">
                  +91 9661644321
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <p>&copy; 2026 SkinGlow. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
            <Link href="/terms-and-conditions" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="/privacy-policy" className="hover:text-foreground transition-colors">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
