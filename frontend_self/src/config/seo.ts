export const SITE_ORIGIN = 'https://ebeeai.net'

export const DEFAULT_OG_IMAGE = `${SITE_ORIGIN}/logo.png`

export const DEFAULT_SITE_NAME = 'EbeeAI'

export const PUBLIC_SITEMAP_PATHS = ['/home', '/login', '/register'] as const

export type OrganizationStructuredData = {
  '@context': 'https://schema.org'
  '@type': 'Organization'
  name: string
  url: string
  logo: string
  description: string
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
