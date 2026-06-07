<template>
  <div
    class="relative flex min-h-screen items-center justify-center overflow-hidden p-4 bg-enterprise-background"
  >
    <!-- Subtle dot grid -->
    <div class="enterprise-dot-grid pointer-events-none absolute inset-0 opacity-40" />

    <!-- Soft gradient wash -->
    <div
      class="pointer-events-none absolute inset-0 bg-gradient-to-br from-enterprise-surface-container-low via-transparent to-enterprise-surface-container-low/50"
    />

    <!-- Content Container -->
    <div class="relative z-10 w-full max-w-md">
      <!-- Logo/Brand -->
      <div class="mb-8 text-center">
        <template v-if="settingsLoaded">
          <div class="mb-4 flex justify-center">
            <img
              :src="siteLogo || '/logo.png'"
              :alt="siteName"
              class="h-16 w-auto object-contain"
            />
          </div>
          <h1 class="mb-2 text-3xl font-bold tracking-tight text-enterprise-on-surface">
            {{ siteName }}
          </h1>
          <p class="text-sm text-enterprise-secondary">
            {{ siteSubtitle }}
          </p>
        </template>
      </div>

      <!-- Card Container -->
      <div class="enterprise-auth-card">
        <slot />
      </div>

      <!-- Footer Links -->
      <div class="mt-6 text-center text-sm text-enterprise-secondary">
        <slot name="footer" />
      </div>

      <!-- Copyright -->
      <div class="mt-8 text-center text-xs text-enterprise-outline">
        &copy; {{ currentYear }} {{ siteName }}. All rights reserved.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAppStore } from '@/stores'
import { DEFAULT_SITE_NAME } from '@/config/seo'
import { sanitizeUrl } from '@/utils/url'

const appStore = useAppStore()

const siteName = computed(() => appStore.siteName || DEFAULT_SITE_NAME)
const siteLogo = computed(() => sanitizeUrl(appStore.siteLogo || '', { allowRelative: true, allowDataUrl: true }))
const siteSubtitle = computed(() => appStore.cachedPublicSettings?.site_subtitle || 'Subscription to API Conversion Platform')
const settingsLoaded = computed(() => appStore.publicSettingsLoaded)

const currentYear = computed(() => new Date().getFullYear())

onMounted(() => {
  appStore.fetchPublicSettings()
})
</script>
