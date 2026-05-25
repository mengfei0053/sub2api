import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { buildHomeStructuredData, DEFAULT_OG_IMAGE, SITE_ORIGIN, type FaqItem } from '@/config/seo'
import { i18n } from '@/i18n'
import { resolveDocumentTitle } from '@/router/title'

const STRUCTURED_DATA_SCRIPT_ID = 'ebeeai-structured-data'

type SeoOptions = {
  route: RouteLocationNormalizedLoaded
  siteName?: string
  customTitle?: string
}

function upsertMeta(name: string, content: string, attribute: 'name' | 'property' = 'name') {
  if (!content) return

  let element = document.head.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement | null
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, name)
    document.head.appendChild(element)
  }
  element.content = content
}

function upsertLink(rel: string, href: string) {
  if (!href) return

  let element = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null
  if (!element) {
    element = document.createElement('link')
    element.rel = rel
    document.head.appendChild(element)
  }
  element.href = href
}

function resolveHomeFaqItems(): FaqItem[] {
  const keys = ['whatIsEbeeai', 'difference', 'apiGateway', 'models', 'apiKey', 'costControl']

  return keys.map((key) => ({
    question: i18n.global.t(`home.ebeeai.faq.items.${key}.question`),
    answer: i18n.global.t(`home.ebeeai.faq.items.${key}.answer`)
  }))
}

function upsertStructuredData(route: RouteLocationNormalizedLoaded, siteName: string | undefined, description: string) {
  const existing = document.getElementById(STRUCTURED_DATA_SCRIPT_ID)

  if (route.name !== 'Home' || !shouldIndexRoute(route)) {
    existing?.remove()
    return
  }

  const script = (existing as HTMLScriptElement | null) ?? document.createElement('script')
  script.id = STRUCTURED_DATA_SCRIPT_ID
  script.type = 'application/ld+json'
  script.textContent = JSON.stringify(buildHomeStructuredData(siteName, description, resolveHomeFaqItems()))

  if (!existing) {
    document.head.appendChild(script)
  }
}

function resolveDescription(route: RouteLocationNormalizedLoaded): string {
  const descriptionKey = route.meta.descriptionKey
  if (typeof descriptionKey === 'string' && descriptionKey.trim()) {
    const translated = i18n.global.t(descriptionKey)
    if (translated && translated !== descriptionKey) {
      return translated
    }
  }

  return i18n.global.t('home.seo.defaultDescription')
}

export function shouldIndexRoute(route: RouteLocationNormalizedLoaded): boolean {
  if (route.meta.indexable === true) return true
  if (route.meta.indexable === false) return false
  return false
}

export function resolveCanonicalUrl(route: RouteLocationNormalizedLoaded): string {
  const path = route.path.endsWith('/') && route.path.length > 1
    ? route.path.slice(0, -1)
    : route.path
  return `${SITE_ORIGIN}${path}`
}

export function applyRouteSeo({ route, siteName, customTitle }: SeoOptions): void {
  const title = customTitle ?? resolveDocumentTitle(route.meta.title, siteName, route.meta.titleKey as string)
  const description = resolveDescription(route)
  const canonicalUrl = resolveCanonicalUrl(route)
  const indexable = shouldIndexRoute(route)

  document.title = title
  upsertMeta('description', description)
  upsertMeta('robots', indexable ? 'index,follow' : 'noindex,nofollow')
  upsertLink('canonical', canonicalUrl)

  upsertMeta('og:type', 'website', 'property')
  upsertMeta('og:site_name', siteName?.trim() || 'EbeeAI', 'property')
  upsertMeta('og:title', title, 'property')
  upsertMeta('og:description', description, 'property')
  upsertMeta('og:url', canonicalUrl, 'property')
  upsertMeta('og:image', DEFAULT_OG_IMAGE, 'property')

  upsertMeta('twitter:card', 'summary_large_image')
  upsertMeta('twitter:title', title)
  upsertMeta('twitter:description', description)
  upsertMeta('twitter:image', DEFAULT_OG_IMAGE)

  upsertStructuredData(route, siteName, description)
}
