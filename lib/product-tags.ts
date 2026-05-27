interface ProductTags {
  suitableForSkin: string[]
  suitableForHair: string[]
  suitableForBody: string[]
  targetConcerns: string[]
  ageGroup: string[]
  budgetTier: string
}

export const PRODUCT_TAGS: Record<string, ProductTags> = {
  'niacinamide-10-zinc-serum': {
    suitableForSkin: ['oily', 'combination', 'all'],
    suitableForHair: [], suitableForBody: [],
    targetConcerns: ['pores', 'acne', 'dullness', 'oily-skin'],
    ageGroup: ['twenties', 'thirties', 'all'], budgetTier: 'mid',
  },
  'vitamin-c-face-wash': {
    suitableForSkin: ['all'],
    suitableForHair: [], suitableForBody: [],
    targetConcerns: ['dullness', 'tan', 'dark-spots'],
    ageGroup: ['all'], budgetTier: 'budget',
  },
  'salicylic-acid-serum-2': {
    suitableForSkin: ['oily', 'combination'],
    suitableForHair: [], suitableForBody: [],
    targetConcerns: ['acne', 'pores', 'oily-skin'],
    ageGroup: ['teens', 'twenties', 'all'], budgetTier: 'mid',
  },
  'hyaluronic-acid-serum': {
    suitableForSkin: ['dry', 'sensitive', 'combination', 'normal'],
    suitableForHair: [], suitableForBody: [],
    targetConcerns: ['hydration', 'anti-aging'],
    ageGroup: ['all'], budgetTier: 'mid',
  },
  'retinol-serum': {
    suitableForSkin: ['all'],
    suitableForHair: [], suitableForBody: [],
    targetConcerns: ['anti-aging', 'dark-spots', 'acne'],
    ageGroup: ['thirties', 'forties', 'fifties-plus'], budgetTier: 'premium',
  },
  'ceramide-moisturizer': {
    suitableForSkin: ['dry', 'sensitive'],
    suitableForHair: [], suitableForBody: [],
    targetConcerns: ['redness', 'hydration'],
    ageGroup: ['all'], budgetTier: 'premium',
  },
  'onion-hair-oil': {
    suitableForSkin: [], suitableForBody: [],
    suitableForHair: ['all'],
    targetConcerns: ['hair-fall', 'growth'],
    ageGroup: ['all'], budgetTier: 'mid',
  },
  'anti-dandruff-shampoo': {
    suitableForSkin: [], suitableForBody: [],
    suitableForHair: ['all'],
    targetConcerns: ['dandruff', 'oily-scalp', 'dry-scalp'],
    ageGroup: ['all'], budgetTier: 'budget',
  },
  'keratin-shampoo': {
    suitableForSkin: [], suitableForBody: [],
    suitableForHair: ['wavy', 'curly', 'coily'],
    targetConcerns: ['frizz', 'damage'],
    ageGroup: ['all'], budgetTier: 'mid',
  },
  'rosemary-hair-oil': {
    suitableForSkin: [], suitableForBody: [],
    suitableForHair: ['all'],
    targetConcerns: ['growth', 'hair-fall'],
    ageGroup: ['all'], budgetTier: 'mid',
  },
  'shea-butter-lotion': {
    suitableForSkin: [], suitableForHair: [],
    suitableForBody: ['dry-body', 'all'],
    targetConcerns: ['dry-body', 'rough-elbows'],
    ageGroup: ['all'], budgetTier: 'budget',
  },
  'coffee-body-scrub': {
    suitableForSkin: [], suitableForHair: [],
    suitableForBody: ['all'],
    targetConcerns: ['cellulite', 'body-tan', 'body-acne'],
    ageGroup: ['all'], budgetTier: 'budget',
  },
  'vitamin-c-body-lotion': {
    suitableForSkin: [], suitableForHair: [],
    suitableForBody: ['all'],
    targetConcerns: ['body-tan', 'dullness'],
    ageGroup: ['all'], budgetTier: 'mid',
  },
  'stretch-mark-oil': {
    suitableForSkin: [], suitableForHair: [],
    suitableForBody: ['all'],
    targetConcerns: ['stretch-marks'],
    ageGroup: ['all'], budgetTier: 'mid',
  },
  'sunscreen-spf50': {
    suitableForSkin: ['all'],
    suitableForHair: [], suitableForBody: [],
    targetConcerns: ['tan', 'dark-spots', 'anti-aging'],
    ageGroup: ['all'], budgetTier: 'mid',
  },
}

export function getDefaultTags(product: { category: string; price: number }): ProductTags {
  const budgetTier =
    product.price < 300 ? 'budget' :
    product.price < 800 ? 'mid' :
    product.price < 2000 ? 'premium' : 'luxury'

  const categoryDefaults: Record<string, Partial<ProductTags>> = {
    'Face Care': { suitableForSkin: ['all'], targetConcerns: ['dullness'] },
    'Hair Care': { suitableForHair: ['all'], targetConcerns: ['hair-fall'] },
    'Body Care': { suitableForBody: ['all'], targetConcerns: ['dry-body'] },
    'Sun Care': { suitableForSkin: ['all'], targetConcerns: ['tan'] },
    'Acne Care': { suitableForSkin: ['oily', 'combination'], targetConcerns: ['acne', 'pores'] },
    'Anti-Aging': { suitableForSkin: ['all'], targetConcerns: ['anti-aging', 'dark-spots'] },
  }

  return {
    suitableForSkin: [],
    suitableForHair: [],
    suitableForBody: [],
    targetConcerns: [],
    ageGroup: ['all'],
    ...categoryDefaults[product.category],
    budgetTier,
  }
}
