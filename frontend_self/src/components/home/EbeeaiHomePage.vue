<template>
  <div class="ebeeai-home min-h-screen bg-enterprise-background text-enterprise-on-background antialiased">
    <!-- Nav -->
    <nav
      class="fixed top-0 z-50 w-full border-b border-enterprise-outline-variant/30 bg-enterprise-surface/80 backdrop-blur-md"
    >
      <div
        class="mx-auto flex h-16 max-w-content items-center justify-between px-margin-mobile md:px-margin-desktop"
      >
        <router-link to="/" class="flex shrink-0 items-center gap-2.5">
          <img
            v-if="siteLogo"
            :src="siteLogo"
            :alt="siteName"
            class="h-8 w-auto object-contain"
          />
          <span class="text-lg font-semibold tracking-tight text-enterprise-primary">
            {{ siteName }}
          </span>
        </router-link>

        <div class="hidden items-center gap-6 md:flex">
          <a
            v-for="link in navLinks"
            :key="link.href"
            :href="link.href"
            class="text-sm font-medium tracking-wide text-enterprise-secondary transition-colors hover:text-enterprise-primary"
          >
            {{ link.label }}
          </a>
        </div>

        <div class="flex items-center gap-2 md:gap-3">
          <!-- Model Plaza Link -->
          <router-link
            v-if="showModelPlazaEntry"
            to="/model-plaza"
            class="inline-flex items-center gap-1.5 rounded px-2.5 py-2 text-sm font-medium text-enterprise-secondary transition-colors hover:text-enterprise-primary"
            :title="t('nav.modelPlaza')"
          >
            <Icon name="grid" size="md" />
            <span class="hidden sm:inline">{{ t('nav.modelPlaza') }}</span>
          </router-link>
          <LocaleSwitcher />
          <router-link
            :to="primaryCtaPath"
            class="hidden items-center justify-center rounded border border-enterprise-primary bg-enterprise-primary px-6 py-2 text-sm font-medium text-enterprise-on-primary transition-colors hover:bg-enterprise-surface hover:text-enterprise-primary md:inline-flex"
          >
            {{ ctaLabel }}
          </router-link>
          <button
            type="button"
            class="inline-flex rounded p-2 text-enterprise-on-surface md:hidden"
            :aria-label="t('home.ebeeai.nav.menu')"
            @click="mobileNavOpen = !mobileNavOpen"
          >
            <Icon :name="mobileNavOpen ? 'x' : 'menu'" size="md" />
          </button>
        </div>
      </div>

      <div
        v-if="mobileNavOpen"
        class="border-t border-enterprise-outline-variant/30 bg-enterprise-surface px-margin-mobile py-4 md:hidden"
      >
        <div class="flex flex-col gap-3">
          <a
            v-for="link in navLinks"
            :key="link.href"
            :href="link.href"
            class="text-sm font-medium text-enterprise-secondary"
            @click="mobileNavOpen = false"
          >
            {{ link.label }}
          </a>
          <router-link
            :to="primaryCtaPath"
            class="mt-2 inline-flex justify-center rounded border border-enterprise-primary bg-enterprise-primary px-4 py-2 text-sm font-medium text-enterprise-on-primary"
            @click="mobileNavOpen = false"
          >
            {{ ctaLabel }}
          </router-link>
        </div>
      </div>
    </nav>

    <main class="ebeeai-scroll-container">
      <!-- Hero -->
      <section
        id="hero"
        class="ebeeai-scroll-section relative flex flex-col items-center justify-center px-margin-mobile md:px-margin-desktop ebeeai-dot-grid"
      >
        <div
          class="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-enterprise-background/50 to-enterprise-background"
        />
        <div class="relative z-10 mx-auto max-w-4xl space-y-6 text-center">
          <div
            class="mb-4 inline-flex items-center gap-2 rounded-full border border-enterprise-outline-variant/50 bg-enterprise-surface-container-low px-4 py-1.5 text-sm font-medium text-enterprise-secondary"
          >
            <span class="h-2 w-2 rounded-full bg-enterprise-primary" />
            {{ t('home.ebeeai.hero.badge', { name: siteName }) }}
          </div>
          <h1
            class="text-4xl font-semibold leading-tight tracking-tighter text-enterprise-primary md:text-6xl"
          >
            {{ t('home.ebeeai.hero.title') }}<br />{{ t('home.ebeeai.hero.titleLine2') }}
          </h1>
          <p class="mx-auto max-w-2xl text-lg leading-relaxed text-enterprise-secondary">
            {{ siteSubtitle || t('home.ebeeai.hero.subtitle') }}
          </p>
          <div class="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
            <router-link
              :to="primaryCtaPath"
              class="inline-flex w-full items-center justify-center gap-2 rounded border border-enterprise-primary bg-enterprise-primary px-10 py-3 text-sm font-medium text-enterprise-on-primary transition-colors hover:bg-enterprise-surface hover:text-enterprise-primary sm:w-auto"
            >
              {{ t('home.ebeeai.hero.trial') }}
              <Icon name="arrowRight" size="sm" />
            </router-link>
            <a
              v-if="docUrl"
              :href="docUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex w-full items-center justify-center rounded border border-enterprise-outline-variant px-10 py-3 text-sm font-medium text-enterprise-primary transition-colors hover:border-enterprise-primary sm:w-auto"
            >
              {{ t('home.ebeeai.hero.readDocs') }}
            </a>
          </div>
        </div>
      </section>

      <!-- Features -->
      <section
        id="features"
        class="ebeeai-scroll-section flex flex-col justify-center bg-enterprise-surface-container-lowest px-margin-mobile md:px-margin-desktop"
      >
        <div class="mx-auto w-full max-w-content">
          <div class="mb-10 text-center md:text-left">
            <h2 class="mb-2 text-3xl font-semibold tracking-tight text-enterprise-primary">
              {{ t('home.ebeeai.features.title') }}
            </h2>
            <p class="text-base text-enterprise-secondary">
              {{ t('home.ebeeai.features.subtitle') }}
            </p>
          </div>
          <div
            class="grid grid-cols-1 gap-px border border-enterprise-outline-variant/30 bg-enterprise-outline-variant/30 md:grid-cols-2"
          >
            <article
              v-for="feature in featureItems"
              :key="feature.key"
              class="group bg-enterprise-surface p-10 transition-colors hover:bg-enterprise-surface-container-low"
            >
              <div
                class="mb-6 flex h-12 w-12 items-center justify-center rounded border border-enterprise-outline-variant/50 bg-enterprise-background transition-colors group-hover:border-enterprise-primary"
              >
                <Icon :name="feature.icon" size="lg" class="text-enterprise-primary" />
              </div>
              <h3 class="mb-4 text-2xl font-medium tracking-tight text-enterprise-primary">
                {{ feature.title }}
              </h3>
              <p class="text-base leading-relaxed text-enterprise-secondary">
                {{ feature.desc }}
              </p>
            </article>
          </div>
        </div>
      </section>

      <!-- Stats -->
      <section
        id="stats"
        class="ebeeai-scroll-section flex flex-col justify-center px-margin-mobile md:px-margin-desktop ebeeai-dot-grid"
      >
        <div class="mx-auto w-full max-w-content">
          <div class="mx-auto max-w-4xl space-y-10">
            <div class="text-center">
              <h2 class="mb-4 text-3xl font-semibold tracking-tight text-enterprise-primary">
                {{ t('home.ebeeai.stats.title') }}
              </h2>
              <p class="mx-auto max-w-2xl text-lg leading-relaxed text-enterprise-secondary">
                {{ t('home.ebeeai.stats.subtitle') }}
              </p>
            </div>
            <div class="grid grid-cols-2 gap-6">
              <div
                v-for="stat in statItems"
                :key="stat.label"
                class="ebeeai-glass-panel rounded p-6 text-center"
              >
                <div class="mb-1 text-3xl font-semibold tracking-tight text-enterprise-primary">
                  {{ stat.value }}
                </div>
                <div
                  class="text-xs font-medium uppercase tracking-wider text-enterprise-secondary"
                >
                  {{ stat.label }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA + Footer -->
      <section
        id="cta"
        class="ebeeai-scroll-section flex flex-col justify-between bg-enterprise-surface-container-lowest px-margin-mobile md:px-margin-desktop"
      >
        <div class="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center text-center">
          <div class="mb-10 w-full">
            <p
              class="mb-6 text-sm font-medium uppercase tracking-wider text-enterprise-secondary"
            >
              {{ t('home.ebeeai.partners.label') }}
            </p>
            <div class="flex flex-wrap items-center justify-center gap-10 opacity-60 grayscale">
              <span
                v-for="partner in partners"
                :key="partner"
                class="text-2xl font-bold tracking-tight text-enterprise-primary"
              >
                {{ partner }}
              </span>
            </div>
          </div>
          <div class="my-10 h-px w-full bg-enterprise-outline-variant/50" />
          <h2 class="mb-6 text-3xl font-semibold leading-tight text-enterprise-primary md:text-5xl">
            {{ t('home.ebeeai.cta.title') }}<br />{{ t('home.ebeeai.cta.titleLine2') }}
          </h2>
          <router-link
            :to="primaryCtaPath"
            class="group inline-flex items-center justify-center gap-3 rounded border border-enterprise-primary bg-enterprise-primary px-10 py-4 text-sm font-medium text-enterprise-on-primary transition-all duration-300 hover:bg-enterprise-surface hover:text-enterprise-primary"
          >
            {{ t('home.ebeeai.cta.button', { name: siteName }) }}
            <Icon
              name="arrowRight"
              size="md"
              class="transition-transform group-hover:translate-x-1"
            />
          </router-link>
        </div>

        <section
          data-testid="home-faq"
          class="mx-auto w-full max-w-content border-t border-enterprise-outline-variant/30 py-12 text-left"
          aria-labelledby="home-faq-title"
        >
          <div class="mb-8 text-center">
            <p class="mb-3 text-sm font-medium uppercase tracking-wider text-enterprise-secondary">
              {{ t('home.ebeeai.faq.eyebrow') }}
            </p>
            <h2
              id="home-faq-title"
              class="text-3xl font-semibold tracking-tight text-enterprise-primary md:text-4xl"
            >
              {{ t('home.ebeeai.faq.title') }}
            </h2>
          </div>
          <div class="grid grid-cols-1 gap-px border border-enterprise-outline-variant/30 bg-enterprise-outline-variant/30 md:grid-cols-2">
            <article
              v-for="item in faqItems"
              :key="item.key"
              class="bg-enterprise-surface p-6 transition-colors hover:bg-enterprise-surface-container-low md:p-8"
            >
              <h3 class="mb-3 text-lg font-medium tracking-tight text-enterprise-primary">
                {{ item.question }}
              </h3>
              <p class="text-sm leading-relaxed text-enterprise-secondary md:text-base">
                {{ item.answer }}
              </p>
            </article>
          </div>
        </section>

        <footer
          class="mx-auto flex w-full max-w-content flex-col items-center justify-between gap-6 border-t border-enterprise-outline-variant/30 py-10 md:flex-row"
        >
          <div class="flex items-center gap-4">
            <img
              v-if="siteLogo"
              :src="siteLogo"
              :alt="siteName"
              class="h-6 w-auto opacity-80"
            />
            <span class="text-sm text-enterprise-secondary">
              &copy; {{ currentYear }} {{ siteName }}.
              {{ t('home.footer.allRightsReserved') }}
            </span>
          </div>
          <div class="flex flex-wrap justify-center gap-6">
            <router-link
              v-for="link in footerLinks"
              :key="link.label"
              :to="link.to"
              class="text-sm text-enterprise-secondary transition-colors hover:text-enterprise-primary"
            >
              {{ link.label }}
            </router-link>
            <a
              v-if="docUrl"
              :href="docUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="text-sm text-enterprise-secondary transition-colors hover:text-enterprise-primary"
            >
              {{ t('home.docs') }}
            </a>
          </div>
        </footer>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore, useAppStore } from '@/stores'
import LocaleSwitcher from '@/components/common/LocaleSwitcher.vue'
import Icon from '@/components/icons/Icon.vue'
import { sanitizeUrl } from '@/utils/url'

const { t } = useI18n()
const authStore = useAuthStore()
const appStore = useAppStore()

const mobileNavOpen = ref(false)

const siteName = computed(
  () => appStore.cachedPublicSettings?.site_name || appStore.siteName || 'EBeeAI'
)
const siteLogo = computed(() =>
  sanitizeUrl(appStore.cachedPublicSettings?.site_logo || appStore.siteLogo || '', { allowRelative: true, allowDataUrl: true })
)
const siteSubtitle = computed(() => {
  const subtitle = appStore.cachedPublicSettings?.site_subtitle?.trim()
  return subtitle && subtitle !== 'Subscription to API Conversion Platform'
    ? subtitle
    : t('home.ebeeai.hero.subtitle')
})
const docUrl = computed(() => sanitizeUrl(appStore.cachedPublicSettings?.doc_url || appStore.docUrl || ''))
const isAuthenticated = computed(() => authStore.isAuthenticated)
const showModelPlazaEntry = computed(() => {
  const settings = appStore.cachedPublicSettings
  const enabled = settings?.model_plaza_enabled === true
  const requiresAuth = settings?.model_plaza_require_auth === true
  return enabled && (isAuthenticated.value || !requiresAuth)
})
const isAdmin = computed(() => authStore.isAdmin)
const primaryCtaPath = computed(() =>
  isAuthenticated.value ? (isAdmin.value ? '/admin/dashboard' : '/dashboard') : '/login'
)
const ctaLabel = computed(() =>
  isAuthenticated.value ? t('home.goToDashboard') : t('home.ebeeai.nav.getStarted')
)

const currentYear = computed(() => new Date().getFullYear())

const navLinks = computed(() => [
  { href: '#features', label: t('home.ebeeai.nav.features') },
  { href: '#stats', label: t('home.ebeeai.nav.solutions') },
  { href: '#cta', label: t('home.ebeeai.nav.pricing') },
  ...(docUrl.value
    ? [{ href: docUrl.value, label: t('home.ebeeai.nav.docs') }]
    : [{ href: '#cta', label: t('home.ebeeai.nav.docs') }])
])

const featureItems = computed(() => [
  {
    key: 'performance',
    icon: 'chart' as const,
    title: t('home.ebeeai.features.items.performance.title'),
    desc: t('home.ebeeai.features.items.performance.desc')
  },
  {
    key: 'multiModel',
    icon: 'swap' as const,
    title: t('home.ebeeai.features.items.multiModel.title'),
    desc: t('home.ebeeai.features.items.multiModel.desc')
  },
  {
    key: 'security',
    icon: 'shield' as const,
    title: t('home.ebeeai.features.items.security.title'),
    desc: t('home.ebeeai.features.items.security.desc')
  },
  {
    key: 'cost',
    icon: 'server' as const,
    title: t('home.ebeeai.features.items.cost.title'),
    desc: t('home.ebeeai.features.items.cost.desc')
  }
])

const statItems = computed(() => [
  { value: '99.99%', label: t('home.ebeeai.stats.sla') },
  { value: '<50ms', label: t('home.ebeeai.stats.latency') },
  { value: '10B+', label: t('home.ebeeai.stats.tokens') },
  { value: '0', label: t('home.ebeeai.stats.breaches') }
])

const partners = ['TECHCORP', 'NEXUS', 'QUANTUM', 'SYNERGY', 'DATASTREAM']

const faqItems = computed(() => [
  {
    key: 'whatIsEbeeai',
    question: t('home.ebeeai.faq.items.whatIsEbeeai.question'),
    answer: t('home.ebeeai.faq.items.whatIsEbeeai.answer')
  },
  {
    key: 'difference',
    question: t('home.ebeeai.faq.items.difference.question'),
    answer: t('home.ebeeai.faq.items.difference.answer')
  },
  {
    key: 'apiGateway',
    question: t('home.ebeeai.faq.items.apiGateway.question'),
    answer: t('home.ebeeai.faq.items.apiGateway.answer')
  },
  {
    key: 'models',
    question: t('home.ebeeai.faq.items.models.question'),
    answer: t('home.ebeeai.faq.items.models.answer')
  },
  {
    key: 'apiKey',
    question: t('home.ebeeai.faq.items.apiKey.question'),
    answer: t('home.ebeeai.faq.items.apiKey.answer')
  },
  {
    key: 'costControl',
    question: t('home.ebeeai.faq.items.costControl.question'),
    answer: t('home.ebeeai.faq.items.costControl.answer')
  }
])

const footerLinks = computed(() => [
  { to: '/legal/privacy', label: t('home.ebeeai.footer.privacy') },
  { to: '/legal/terms', label: t('home.ebeeai.footer.terms') },
  { to: '/legal/security', label: t('home.ebeeai.footer.security') },
  { to: '/legal/status', label: t('home.ebeeai.footer.status') }
])
</script>

<style scoped>
.ebeeai-home {
  font-family: 'Geist', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.ebeeai-scroll-container {
  height: 100vh;
  overflow-y: auto;
  scroll-snap-type: y mandatory;
}

.ebeeai-scroll-section {
  min-height: 100vh;
  scroll-snap-align: start;
  scroll-snap-stop: always;
  padding-top: 4rem;
}

.ebeeai-dot-grid {
  background-image: radial-gradient(#cfc4c5 1px, transparent 1px);
  background-size: 24px 24px;
  background-position: -12px -12px;
}

.ebeeai-glass-panel {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  border: 1px solid #e5e2e1;
}
</style>
