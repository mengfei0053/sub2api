import { describe, expect, it } from 'vitest'
import { buildOrganizationStructuredData } from '@/config/seo'
import { shouldIndexRoute, resolveCanonicalUrl } from '@/router/seo'

describe('route seo helpers', () => {
  it('only indexes routes explicitly marked as indexable', () => {
    expect(shouldIndexRoute({ meta: { indexable: true } } as any)).toBe(true)
    expect(shouldIndexRoute({ meta: { indexable: false } } as any)).toBe(false)
    expect(shouldIndexRoute({ meta: {} } as any)).toBe(false)
  })

  it('builds canonical urls from the production origin', () => {
    expect(resolveCanonicalUrl({ path: '/' } as any)).toBe('https://ebeeai.net/')
    expect(resolveCanonicalUrl({ path: '/login/' } as any)).toBe('https://ebeeai.net/login')
  })
})

describe('organization structured data', () => {
  it('uses the production origin and logo for Organization schema', () => {
    expect(buildOrganizationStructuredData('EbeeAI', 'Enterprise AI gateway')).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'EbeeAI',
      url: 'https://ebeeai.net',
      logo: 'https://ebeeai.net/logo.png',
      description: 'Enterprise AI gateway'
    })
  })

  it('falls back to the default brand name', () => {
    expect(buildOrganizationStructuredData(undefined, 'Default description').name).toBe('EbeeAI')
  })
})
