import { describe, expect, it, vi, beforeEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import OpenAIQuotaResetCell from '../OpenAIQuotaResetCell.vue'
import type { Account } from '@/types'

const { queryOpenAIQuota, resetOpenAIQuota } = vi.hoisted(() => ({
  queryOpenAIQuota: vi.fn(),
  resetOpenAIQuota: vi.fn()
}))

vi.mock('@/api/admin/accounts', () => ({
  queryOpenAIQuota,
  resetOpenAIQuota
}))

vi.mock('vue-i18n', async () => {
  const actual = await vi.importActual<typeof import('vue-i18n')>('vue-i18n')
  return {
    ...actual,
    useI18n: () => ({
      t: (key: string, params?: Record<string, unknown>) => {
        if (params) return `${key}:${JSON.stringify(params)}`
        return key
      }
    })
  }
})

function makeAccount(overrides: Partial<Account> = {}): Account {
  return {
    id: 1,
    name: 'OpenAI account',
    platform: 'openai',
    type: 'oauth',
    proxy_id: null,
    concurrency: 1,
    priority: 1,
    status: 'active',
    error_message: null,
    last_used_at: null,
    expires_at: null,
    auto_pause_on_expired: true,
    created_at: '2026-03-15T00:00:00Z',
    updated_at: '2026-03-15T00:00:00Z',
    schedulable: true,
    rate_limited_at: null,
    rate_limit_reset_at: null,
    overload_until: null,
    temp_unschedulable_until: null,
    temp_unschedulable_reason: null,
    session_window_start: null,
    session_window_end: null,
    session_window_status: null,
    ...overrides
  }
}

describe('OpenAIQuotaResetCell', () => {
  beforeEach(() => {
    queryOpenAIQuota.mockReset()
    resetOpenAIQuota.mockReset()
  })

  it('only renders for OpenAI OAuth accounts and keeps parent pre-actions', () => {
    const hidden = mount(OpenAIQuotaResetCell, {
      props: {
        account: makeAccount({ platform: 'anthropic', type: 'oauth' })
      },
      slots: {
        'pre-actions': '<button class="active-query">active</button>'
      }
    })

    expect(hidden.text()).toBe('')

    const visible = mount(OpenAIQuotaResetCell, {
      props: {
        account: makeAccount()
      },
      slots: {
        'pre-actions': '<button class="active-query">active</button>'
      }
    })

    expect(visible.find('.active-query').exists()).toBe(true)
    expect(visible.text()).toContain('admin.accounts.openaiQuotaReset.count')
    expect(visible.text()).toContain('admin.accounts.openaiQuotaReset.reset')
  })

  it('queries reset-credit count and consumes one reset credit', async () => {
    queryOpenAIQuota
      .mockResolvedValueOnce({
        rate_limit_reset_credits: { available_count: 2 },
        fetched_at: 1
      })
      .mockResolvedValueOnce({
        rate_limit_reset_credits: { available_count: 1 },
        fetched_at: 2
      })
    resetOpenAIQuota.mockResolvedValue({
      code: 'ok',
      windows_reset: 2,
      credit: { id: 'credit-1' }
    })

    const wrapper = mount(OpenAIQuotaResetCell, {
      props: {
        account: makeAccount({ id: 42 })
      }
    })

    const buttons = wrapper.findAll('button')
    expect(buttons).toHaveLength(2)
    expect(buttons[1].attributes('disabled')).toBeDefined()

    await buttons[0].trigger('click')
    await flushPromises()

    expect(queryOpenAIQuota).toHaveBeenCalledWith(42)
    expect(wrapper.text()).toContain('admin.accounts.openaiQuotaReset.count2')
    expect(wrapper.findAll('button')[1].attributes('disabled')).toBeUndefined()

    await wrapper.findAll('button')[1].trigger('click')
    await flushPromises()

    expect(resetOpenAIQuota).toHaveBeenCalledWith(42)
    expect(queryOpenAIQuota).toHaveBeenCalledTimes(2)
    expect(wrapper.text()).toContain('admin.accounts.openaiQuotaReset.count1')
    expect(wrapper.text()).toContain('admin.accounts.openaiQuotaReset.resetSuccess')
    expect(wrapper.text()).toContain('"windows":2')
  })
})
