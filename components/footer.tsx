import { Mail, Phone } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-muted/50 border-t mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold text-lg mb-4">SkinGlow</h3>
            <p className="text-sm text-muted-foreground">Your trusted multi-vendor skincare marketplace</p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="/products" className="hover:text-foreground transition-colors">
                  Products
                </a>
              </li>
              <li>
                <a href="/#categories" className="hover:text-foreground transition-colors">
                  Categories
                </a>
              </li>
              <li>
                <a href="/#reviews" className="hover:text-foreground transition-colors">
                  Reviews
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="/my-orders" className="hover:text-foreground transition-colors">
                  My Orders
                </a>
              </li>
              <li>
                <a href="/login" className="hover:text-foreground transition-colors">
                  Login
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                swatikumari7255@gmail.com
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                +91-8102065486
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; 2025 SkinGlow. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
