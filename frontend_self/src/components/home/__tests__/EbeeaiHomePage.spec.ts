import { shallowMount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { computed } from 'vue'
import EbeeaiHomePage from '../EbeeaiHomePage.vue'

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock('@/stores', () => ({
  useAuthStore: () => ({
    isAuthenticated: false,
    isAdmin: false,
  }),
  useAppStore: () => ({
    cachedPublicSettings: null,
    siteName: 'EbeeAI',
    siteLogo: '',
    docUrl: '',
  }),
}))

vi.mock('@/components/common/LocaleSwitcher.vue', () => ({
  default: {
    name: 'LocaleSwitcher',
    template: '<div />',
  },
}))

vi.mock('@/components/icons/Icon.vue', () => ({
  default: {
    name: 'Icon',
    template: '<span />',
  },
}))

function mountHomePage() {
  return shallowMount(EbeeaiHomePage, {
    global: {
      stubs: {
        RouterLink: {
          props: ['to'],
          template: '<a><slot /></a>',
        },
      },
    },
  })
}

describe('EbeeaiHomePage FAQ section', () => {
  it('renders a standalone FAQ section above the footer', () => {
    const wrapper = mountHomePage()

    const faq = wrapper.get('[data-testid="home-faq"]')
    const footer = wrapper.get('footer')

    expect(faq.text()).toContain('home.ebeeai.faq.title')
    expect(faq.text()).toContain('home.ebeeai.faq.items.whatIsEbeeai.question')
    expect(faq.text()).toContain('home.ebeeai.faq.items.apiGateway.question')
    expect(faq.text()).toContain('home.ebeeai.faq.items.costControl.answer')
    expect(faq.element.compareDocumentPosition(footer.element) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })
})

describe('EbeeaiHomePage stats section', () => {
  it('does not render the realtime routing log panel', () => {
    const wrapper = mountHomePage()

    expect(wrapper.text()).not.toContain('home.ebeeai.stats.logTitle')
    expect(wrapper.text()).not.toContain('REQ_ID_A9F2')
  })
})
