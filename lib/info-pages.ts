export type InfoPage = {
  slug: string
  eyebrow: string
  title: string
  description: string
  sections: Array<{
    title: string
    body: string
    items?: string[]
  }>
  cta?: {
    label: string
    href: string
  }
}

export const infoPages: InfoPage[] = [
  {
    slug: 'faq',
    eyebrow: 'Support',
    title: 'Frequently Asked Questions',
    description: 'Quick answers about ordering, payments, shipping, returns, and shopping skincare on SkinGlow.',
    sections: [
      { title: 'Orders', body: 'You can place orders after logging in and adding items to your cart. Order status is available from My Orders.', items: ['Cash on Delivery, UPI, and card options may appear at checkout.', 'Saved addresses make repeat orders faster.', 'You receive an order confirmation after checkout.'] },
      { title: 'Products', body: 'Each product page includes pricing, stock, ratings, ingredients, usage directions, and category details.' },
      { title: 'Support', body: 'For help with an order, contact SkinGlow with your order number and registered email address.' },
    ],
    cta: { label: 'Contact Support', href: '/contact' },
  },
  {
    slug: 'help-center',
    eyebrow: 'Support',
    title: 'Help Center',
    description: 'A practical hub for account, checkout, delivery, returns, and product support.',
    sections: [
      { title: 'Account Help', body: 'Manage your profile, saved addresses, wishlist, and orders from your account pages.' },
      { title: 'Checkout Help', body: 'If the payment button does not respond, confirm your address is complete and your cart still has available products.' },
      { title: 'Product Help', body: 'Check ingredient lists and usage instructions before using any new active ingredient.' },
    ],
    cta: { label: 'View My Orders', href: '/my-orders' },
  },
  {
    slug: 'track-order',
    eyebrow: 'Orders',
    title: 'Track Your Order',
    description: 'Follow your SkinGlow order from confirmation to delivery.',
    sections: [
      { title: 'Where to Track', body: 'Log in and open My Orders to see the latest status for every order.' },
      { title: 'Statuses', body: 'Orders can move through pending, processing, shipped, delivered, cancelled, or refunded states.' },
      { title: 'Delivery Updates', body: 'If a tracking number is available, it will appear on the order detail page.' },
    ],
    cta: { label: 'Open My Orders', href: '/my-orders' },
  },
  {
    slug: 'authenticity-guarantee',
    eyebrow: 'Trust',
    title: 'Authenticity Guarantee',
    description: 'SkinGlow is built around verified sellers and genuine products.',
    sections: [
      { title: 'Verified Sellers', body: 'Vendor accounts are expected to follow SkinGlow product, packaging, and fulfilment standards.' },
      { title: 'Product Checks', body: 'Listings include brand, category, images, stock, ingredients, and how-to-use details for better transparency.' },
      { title: 'Report a Concern', body: 'If a product looks incorrect, damaged, or suspicious, contact support with photos and your order number.' },
    ],
    cta: { label: 'Contact Us', href: '/contact' },
  },
  {
    slug: 'payment-security',
    eyebrow: 'Checkout',
    title: 'Payment Security',
    description: 'How SkinGlow keeps checkout focused, clear, and protected.',
    sections: [
      { title: 'Secure Checkout', body: 'Checkout uses protected sessions, validated addresses, and controlled order creation.' },
      { title: 'Payment Methods', body: 'UPI, card, and Cash on Delivery flows are designed to collect only necessary order information.' },
      { title: 'Best Practices', body: 'Never share OTPs, passwords, CVV, or UPI PINs with anyone claiming to represent SkinGlow.' },
    ],
    cta: { label: 'Go to Cart', href: '/cart' },
  },
  {
    slug: 'cancellation-policy',
    eyebrow: 'Policy',
    title: 'Cancellation Policy',
    description: 'Understand when and how SkinGlow orders can be cancelled.',
    sections: [
      { title: 'Before Shipment', body: 'Orders may be cancelled before shipment if they have not already entered fulfilment.' },
      { title: 'After Shipment', body: 'Once shipped, the order may need to follow the return process instead of cancellation.' },
      { title: 'Unavailable Stock', body: 'SkinGlow may cancel items if seller stock becomes unavailable or address validation fails.' },
    ],
    cta: { label: 'Read Returns', href: '/shipping-returns' },
  },
  {
    slug: 'refund-policy',
    eyebrow: 'Policy',
    title: 'Refund Policy',
    description: 'How refunds are reviewed and processed for eligible orders.',
    sections: [
      { title: 'Refund Review', body: 'Refunds are initiated after cancellation approval or return inspection.' },
      { title: 'Timeline', body: 'Bank and payment-provider timelines can vary, but most refunds reflect within 5-7 business days after initiation.' },
      { title: 'Original Payment Method', body: 'Where possible, refunds are sent back to the original payment method used at checkout.' },
    ],
    cta: { label: 'Contact Support', href: '/contact' },
  },
  {
    slug: 'cookie-policy',
    eyebrow: 'Legal',
    title: 'Cookie Policy',
    description: 'How SkinGlow may use browser storage to support account, cart, and shopping features.',
    sections: [
      { title: 'Essential Storage', body: 'Cart, session, and preference data may be stored to keep core shopping flows working.' },
      { title: 'Analytics', body: 'Analytics may help improve performance, product discovery, and site usability.' },
      { title: 'Your Controls', body: 'You can control browser cookies and local storage through your browser settings.' },
    ],
    cta: { label: 'Privacy Policy', href: '/privacy-policy' },
  },
  {
    slug: 'accessibility',
    eyebrow: 'Experience',
    title: 'Accessibility',
    description: 'SkinGlow aims to make skincare shopping clear, navigable, and usable.',
    sections: [
      { title: 'Readable Interfaces', body: 'Pages use clear headings, predictable navigation, and accessible contrast where possible.' },
      { title: 'Keyboard Navigation', body: 'Core links, buttons, forms, and menus should remain reachable without a mouse.' },
      { title: 'Feedback', body: 'If you find an accessibility issue, contact support with the page URL and device details.' },
    ],
    cta: { label: 'Send Feedback', href: '/contact' },
  },
  {
    slug: 'ingredient-glossary',
    eyebrow: 'Education',
    title: 'Ingredient Glossary',
    description: 'A quick guide to popular skincare ingredients and what they are commonly used for.',
    sections: [
      { title: 'Hydration', body: 'Hyaluronic Acid, glycerin, aloe, and panthenol help attract or hold moisture.' },
      { title: 'Acne Care', body: 'Salicylic Acid, niacinamide, zinc PCA, tea tree, and cica are commonly used in acne routines.' },
      { title: 'Aging & Texture', body: 'Retinol, peptides, bakuchiol, ceramides, and antioxidants support smoother-looking skin.' },
    ],
    cta: { label: 'Shop Ingredients', href: '/products' },
  },
  {
    slug: 'skincare-routine',
    eyebrow: 'Guide',
    title: 'Skincare Routine',
    description: 'A simple AM and PM skincare routine structure for beginners.',
    sections: [
      { title: 'Morning', body: 'Cleanser, optional serum, moisturizer, and sunscreen make a strong everyday routine.' },
      { title: 'Night', body: 'Cleanser, treatment serum, and moisturizer help repair and reset skin overnight.' },
      { title: 'Introduce Slowly', body: 'Start one active at a time and patch test if you have sensitive skin.' },
    ],
    cta: { label: 'Read Skin Guide', href: '/skin-guide' },
  },
  {
    slug: 'skin-types',
    eyebrow: 'Guide',
    title: 'Skin Types',
    description: 'Understand oily, dry, combination, sensitive, and normal skin needs.',
    sections: [
      { title: 'Oily Skin', body: 'Look for lightweight gels, niacinamide, zinc, and non-comedogenic sunscreen.' },
      { title: 'Dry Skin', body: 'Use cream cleansers, humectants, ceramides, and richer moisturizers.' },
      { title: 'Sensitive Skin', body: 'Keep routines minimal and avoid adding multiple strong actives at once.' },
    ],
    cta: { label: 'Shop Face Care', href: '/products?category=Face%20Care' },
  },
  {
    slug: 'dermatologist-tips',
    eyebrow: 'Education',
    title: 'Dermatologist-Inspired Tips',
    description: 'Simple habits that make skincare easier to follow.',
    sections: [
      { title: 'Consistency Wins', body: 'A basic routine used daily is usually better than a complicated routine used rarely.' },
      { title: 'Sunscreen Matters', body: 'Most brightening and anti-aging routines need daily SPF to protect results.' },
      { title: 'Do Not Over-Exfoliate', body: 'Too many acids or scrubs can irritate the skin barrier.' },
    ],
    cta: { label: 'Shop Sun Care', href: '/products?category=Sun%20Care' },
  },
  {
    slug: 'best-sellers',
    eyebrow: 'Shopping',
    title: 'Best Sellers',
    description: 'Find popular products based on ratings, reviews, and everyday skincare needs.',
    sections: [
      { title: 'Popular Categories', body: 'Face wash, niacinamide serum, sunscreen, moisturizers, and hair oil are frequent routine staples.' },
      { title: 'How to Choose', body: 'Filter by category, brand, price, and concern to narrow down the catalogue.' },
      { title: 'Before You Buy', body: 'Check ingredients and how-to-use details on the product page.' },
    ],
    cta: { label: 'Browse Products', href: '/products?sort=popular' },
  },
  {
    slug: 'new-arrivals',
    eyebrow: 'Shopping',
    title: 'New Arrivals',
    description: 'Explore fresh products and routine additions across SkinGlow.',
    sections: [
      { title: 'What Is New', body: 'New arrivals may include active serums, SPF formats, hair treatments, and body care launches.' },
      { title: 'Try Carefully', body: 'When trying a new active, introduce it gradually and avoid layering too many treatments.' },
      { title: 'Compare First', body: 'Use filters and product details to compare similar products before purchasing.' },
    ],
    cta: { label: 'See Products', href: '/products?sort=newest' },
  },
  {
    slug: 'offers',
    eyebrow: 'Shopping',
    title: 'Offers & Deals',
    description: 'Save on routine essentials, seasonal picks, and multi-category skincare shopping.',
    sections: [
      { title: 'Coupons', body: 'Coupons may apply based on cart value, product eligibility, or campaign rules.' },
      { title: 'Free Shipping', body: 'Orders above ₹499 qualify for free shipping in the current checkout setup.' },
      { title: 'Smart Savings', body: 'Stock up on repeat essentials like cleanser, moisturizer, sunscreen, and hair care.' },
    ],
    cta: { label: 'Shop Offers', href: '/products' },
  },
  {
    slug: 'gift-cards',
    eyebrow: 'Gifting',
    title: 'Gift Cards',
    description: 'Give someone the flexibility to choose skincare that suits their own routine.',
    sections: [
      { title: 'For Every Routine', body: 'Gift cards are ideal when you are unsure about skin type, shade, fragrance, or active tolerance.' },
      { title: 'Occasions', body: 'Birthdays, self-care hampers, wedding prep, festive gifting, and corporate wellness kits.' },
      { title: 'Coming Soon', body: 'Digital gift card checkout can be added as a future store feature.' },
    ],
    cta: { label: 'Contact for Gifting', href: '/contact' },
  },
  {
    slug: 'loyalty-rewards',
    eyebrow: 'Rewards',
    title: 'Loyalty Rewards',
    description: 'A future-ready rewards page for repeat SkinGlow shoppers.',
    sections: [
      { title: 'Earn', body: 'Customers can earn rewards for purchases, reviews, referrals, and routine milestones.' },
      { title: 'Redeem', body: 'Rewards can support discounts, free shipping, early access, or skincare samples.' },
      { title: 'Status', body: 'This page prepares the website for a loyalty system as the store grows.' },
    ],
    cta: { label: 'Start Shopping', href: '/products' },
  },
  {
    slug: 'corporate-gifting',
    eyebrow: 'Business',
    title: 'Corporate Gifting',
    description: 'Curated skincare and wellness gifting for teams, events, and client hampers.',
    sections: [
      { title: 'Gift Sets', body: 'Build hampers around sunscreen, body care, moisturizers, lip care, and gentle cleansers.' },
      { title: 'Bulk Requests', body: 'For bulk gifting, share quantity, budget range, delivery city, and preferred categories.' },
      { title: 'Personalization', body: 'Gift notes, routine cards, and category-based bundles can make gifts more useful.' },
    ],
    cta: { label: 'Request Gifting Help', href: '/contact' },
  },
  {
    slug: 'become-a-seller',
    eyebrow: 'Marketplace',
    title: 'Become a Seller',
    description: 'Sell skincare, hair care, body care, and wellness products through SkinGlow.',
    sections: [
      { title: 'Who Can Join', body: 'Brands, distributors, and verified sellers with genuine products can apply.' },
      { title: 'Seller Standards', body: 'Sellers should maintain accurate listings, fresh stock, safe packaging, and timely dispatch.' },
      { title: 'Next Step', body: 'Contact SkinGlow with your brand details, catalogue, GST information, and fulfilment capacity.' },
    ],
    cta: { label: 'Contact Marketplace Team', href: '/contact' },
  },
  {
    slug: 'affiliate-program',
    eyebrow: 'Creators',
    title: 'Affiliate Program',
    description: 'A page for creators, skincare educators, and partners who want to recommend SkinGlow.',
    sections: [
      { title: 'Who It Is For', body: 'Skincare creators, bloggers, routine educators, dermatology clinics, and community pages.' },
      { title: 'How It Works', body: 'Partners can share curated product links, routine guides, and campaign offers.' },
      { title: 'Apply', body: 'Send your profile, audience details, and collaboration idea to the SkinGlow team.' },
    ],
    cta: { label: 'Apply Now', href: '/contact' },
  },
  {
    slug: 'careers',
    eyebrow: 'Company',
    title: 'Careers',
    description: 'Join SkinGlow to build a cleaner, calmer skincare shopping experience.',
    sections: [
      { title: 'Open Areas', body: 'Customer support, catalogue operations, vendor management, content, and engineering.' },
      { title: 'How We Work', body: 'We value clear product information, fast customer help, and practical design.' },
      { title: 'Apply', body: 'Send your resume and role interest to the SkinGlow contact email.' },
    ],
    cta: { label: 'Contact Us', href: '/contact' },
  },
  {
    slug: 'press',
    eyebrow: 'Company',
    title: 'Press',
    description: 'SkinGlow company information for announcements, media enquiries, and brand stories.',
    sections: [
      { title: 'About SkinGlow', body: 'SkinGlow is a multi-vendor skincare marketplace focused on product discovery and simple checkout.' },
      { title: 'Media Enquiries', body: 'For quotes, founder notes, or marketplace information, contact the SkinGlow team.' },
      { title: 'Brand Assets', body: 'Use the SkinGlow name and logo only for accurate references to the marketplace.' },
    ],
    cta: { label: 'Email Press Team', href: '/contact' },
  },
  {
    slug: 'sustainability',
    eyebrow: 'Values',
    title: 'Sustainability',
    description: 'SkinGlow supports thoughtful shopping and better product transparency.',
    sections: [
      { title: 'Less Waste', body: 'Choosing products by need helps reduce unused bottles and impulse purchases.' },
      { title: 'Better Discovery', body: 'Clear categories, ingredients, and instructions help customers buy what they can actually use.' },
      { title: 'Future Goals', body: 'Sustainable packaging filters, refill options, and conscious brand badges can be added as the marketplace grows.' },
    ],
    cta: { label: 'Browse Products', href: '/products' },
  },
  {
    slug: 'site-map',
    eyebrow: 'Directory',
    title: 'Site Map',
    description: 'A quick directory of SkinGlow shopping, support, policy, and education pages.',
    sections: [
      { title: 'Shopping', body: 'Browse catalogue pages, category pages, brand pages, offers, new arrivals, and best sellers.', items: ['Products', 'Brands', 'Best Sellers', 'New Arrivals', 'Offers'] },
      { title: 'Support', body: 'Find help for orders, shipping, returns, payments, refunds, and cancellations.', items: ['Help Center', 'FAQ', 'Track Order', 'Shipping & Returns', 'Contact'] },
      { title: 'Learn', body: 'Use ingredient and routine pages to make clearer skincare choices.', items: ['Skin Guide', 'Ingredient Glossary', 'Skin Types', 'Dermatologist Tips'] },
    ],
    cta: { label: 'Browse Products', href: '/products' },
  },
]

export const infoPageMap = new Map(infoPages.map((page) => [page.slug, page]))
