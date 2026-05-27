export const SITE_ORIGIN = 'https://ebeeai.net'

export const DEFAULT_OG_IMAGE = `${SITE_ORIGIN}/logo.png`

export const DEFAULT_SITE_NAME = 'EbeeAI'

export const PUBLIC_SITEMAP_PATHS = ['/', '/login', '/register'] as const

export type OrganizationStructuredData = {
  '@context': 'https://schema.org'
  '@type': 'Organization'
  name: string
  url: string
  logo: string
  description: string
}

export type SoftwareApplicationStructuredData = {
  '@context': 'https://schema.org'
  '@type': 'SoftwareApplication'
  name: string
  url: string
  image: string
  applicationCategory: 'DeveloperApplication'
  applicationSubCategory: string
  operatingSystem: 'Web'
  description: string
  offers: {
    '@type': 'Offer'
    price: string
    priceCurrency: string
  }
}

export type FaqPageStructuredData = {
  '@context': 'https://schema.org'
  '@type': 'FAQPage'
  mainEntity: Array<{
    '@type': 'Question'
    name: string
    acceptedAnswer: {
      '@type': 'Answer'
      text: string
    }
  }>
}

export type HomeStructuredData = [
  OrganizationStructuredData,
  SoftwareApplicationStructuredData,
  FaqPageStructuredData
]

export type FaqItem = {
  question: string
  answer: string
}

export function buildOrganizationStructuredData(
  siteName?: string,
  description?: string
): OrganizationStructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteName?.trim() || DEFAULT_SITE_NAME,
    url: SITE_ORIGIN,
    logo: DEFAULT_OG_IMAGE,
    description: description?.trim() || ''
  }
}

export function buildSoftwareApplicationStructuredData(
  siteName?: string,
  description?: string
): SoftwareApplicationStructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: siteName?.trim() || DEFAULT_SITE_NAME,
    url: SITE_ORIGIN,
    image: DEFAULT_OG_IMAGE,
    applicationCategory: 'DeveloperApplication',
    applicationSubCategory: 'AI API Gateway',
    operatingSystem: 'Web',
    description: description?.trim() || '',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    }
  }
}

export function buildFaqPageStructuredData(faqItems: FaqItem[]): FaqPageStructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer
      }
    }))
  }
}

export function buildHomeStructuredData(
  siteName?: string,
  description?: string,
  faqItems: FaqItem[] = []
): HomeStructuredData {
  return [
    buildOrganizationStructuredData(siteName, description),
    buildSoftwareApplicationStructuredData(siteName, description),
    buildFaqPageStructuredData(faqItems)
  ]
}
