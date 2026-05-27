interface ProfileLike {
  skinType: string | null
  skinConcerns: string[]
  hairType: string | null
  hairConcerns: string[]
  bodyConcerns: string[]
  budget: string | null
}

interface ProductLike {
  suitableForSkin: string[]
  suitableForHair: string[]
  targetConcerns: string[]
  budgetTier: string
  rating: number
  price: number
}

export function calculateMatchScore(product: ProductLike, profile: ProfileLike): number {
  let score = 0
  const skin = profile.skinType?.toLowerCase() ?? ''

  if (skin && product.suitableForSkin.includes(skin)) score += 30
  if (product.suitableForSkin.includes('all')) score += 10

  const hair = profile.hairType?.toLowerCase() ?? ''
  if (hair && product.suitableForHair.includes(hair)) score += 20
  if (product.suitableForHair.includes('all')) score += 8

  const skinMatches = profile.skinConcerns.filter((c) => product.targetConcerns.includes(c))
  score += skinMatches.length * 20

  const hairMatches = profile.hairConcerns.filter((c) => product.targetConcerns.includes(c))
  score += hairMatches.length * 15

  const bodyMatches = profile.bodyConcerns.filter((c) => product.targetConcerns.includes(c))
  score += bodyMatches.length * 15

  score += product.rating * 2

  return score
}

export function getMatchReasons(
  product: ProductLike & { name?: string; category?: string },
  profile: ProfileLike
): string[] {
  const reasons: string[] = []
  const skin = profile.skinType?.toLowerCase() ?? ''

  if (skin && product.suitableForSkin.includes(skin)) {
    reasons.push(`Great for ${skin} skin`)
  } else if (product.suitableForSkin.includes('all')) {
    reasons.push('Suitable for all skin types')
  }

  const skinMatches = profile.skinConcerns.filter((c) => product.targetConcerns.includes(c))
  if (skinMatches.length > 0) {
    reasons.push(`Targets ${skinMatches[0].replace(/-/g, ' ')}`)
  }

  const hairMatches = profile.hairConcerns.filter((c) => product.targetConcerns.includes(c))
  if (hairMatches.length > 0) {
    reasons.push(`Helps with ${hairMatches[0].replace(/-/g, ' ')}`)
  }

  const bodyMatches = profile.bodyConcerns.filter((c) => product.targetConcerns.includes(c))
  if (bodyMatches.length > 0) {
    reasons.push(`Addresses ${bodyMatches[0].replace(/-/g, ' ')}`)
  }

  if (profile.budget && product.budgetTier === profile.budget) {
    reasons.push('Within your budget')
  }

  return reasons
}

export const SKIN_TYPE_LABELS: Record<string, string> = {
  OILY: 'Oily Skin', DRY: 'Dry Skin', COMBINATION: 'Combination Skin',
  SENSITIVE: 'Sensitive Skin', NORMAL: 'Normal Skin',
  oily: 'Oily Skin', dry: 'Dry Skin', combination: 'Combination Skin',
  sensitive: 'Sensitive Skin', normal: 'Normal Skin',
}

export const HAIR_TYPE_LABELS: Record<string, string> = {
  STRAIGHT: 'Straight Hair', WAVY: 'Wavy Hair', CURLY: 'Curly Hair', COILY: 'Coily Hair',
  straight: 'Straight Hair', wavy: 'Wavy Hair', curly: 'Curly Hair', coily: 'Coily Hair',
}

export const BUDGET_LABELS: Record<string, string> = {
  BUDGET: 'Under ₹299', MID: '₹300–₹799', PREMIUM: '₹800–₹1999', LUXURY: '₹2000+',
  budget: 'Under ₹299', mid: '₹300–₹799', premium: '₹800–₹1999', luxury: '₹2000+',
}
