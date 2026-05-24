import { describe, expect, it } from 'vitest'
import { shouldIndexRoute, resolveCanonicalUrl } from '@/router/seo'

describe('route seo helpers', () => {
  it('only indexes routes explicitly marked as indexable', () => {
    expect(shouldIndexRoute({ meta: { indexable: true } } as any)).toBe(true)
    expect(shouldIndexRoute({ meta: { indexable: false } } as any)).toBe(false)
    expect(shouldIndexRoute({ meta: {} } as any)).toBe(false)
  })

  it('builds canonical urls from the production origin', () => {
    expect(resolveCanonicalUrl({ path: '/home' } as any)).toBe('https://ebeeai.net/home')
    expect(resolveCanonicalUrl({ path: '/login/' } as any)).toBe('https://ebeeai.net/login')
  })
})
