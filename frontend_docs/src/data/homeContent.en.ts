/** English — aligned with frontend_self/src/i18n/locales/en.ts home.ebeeai */

const siteName = 'EbeeAI';

export const homeContentEn = {
  nav: {
    features: 'Features',
    solutions: 'Solutions',
    pricing: 'Pricing',
    docs: 'Documentation',
    getStarted: 'Get Started',
    menu: 'Menu',
  },
  hero: {
    badge: `${siteName} Gateway is live`,
    title: 'AI API Gateway &',
    titleLine2: 'Multi-Model Unified Access Platform',
    subtitle:
      'One API key to access Claude, GPT, Gemini, and other leading AI models, with multi-model routing, usage analytics, and pay-as-you-go billing.',
    trial: 'Request a Trial',
    readDocs: 'Read Documentation',
  },
  features: {
    title: 'Features',
    subtitle: 'Enterprise-grade standards for efficient, stable AI services.',
    items: [
      {
        key: 'performance',
        title: 'High-Performance Gateway',
        desc: 'Sub-millisecond latency (<50ms) and high-throughput architecture for high-concurrency workloads.',
      },
      {
        key: 'multiModel',
        title: 'Multi-Model Support',
        desc: 'Unified API for OpenAI, Claude, Gemini, and leading open models with lower switching cost.',
      },
      {
        key: 'security',
        title: 'Security & Compliance',
        desc: 'Content filtering, PII redaction, fine-grained access control, and audit logs for enterprise compliance.',
      },
      {
        key: 'cost',
        title: 'Cost Control',
        desc: 'Semantic caching, request batching, and routing optimization to reduce API spend.',
      },
    ],
  },
  stats: {
    title: 'Proven at Scale',
    subtitle: 'Built for complex enterprise environments with financial-grade stability.',
    items: [
      {value: '99.99%', label: 'SLA Uptime'},
      {value: '<50ms', label: 'Gateway Latency'},
      {value: '10B+', label: 'Daily Tokens'},
      {value: '0', label: 'Data Breaches'},
    ],
  },
  partners: {
    label: 'Trusted by industry leaders',
    names: ['TECHCORP', 'NEXUS', 'QUANTUM', 'SYNERGY', 'DATASTREAM'],
  },
  cta: {
    title: 'Ready to upgrade your',
    titleLine2: 'AI infrastructure?',
    button: `Integrate ${siteName} Gateway`,
  },
  faq: {
    eyebrow: 'FAQ',
    title: 'Frequently Asked Questions about EbeeAI',
    items: [
      {
        key: 'whatIsEbeeai',
        question: 'What is EbeeAI?',
        answer:
          'EbeeAI is an AI API gateway and multi-model access platform for developers and teams. One API key connects Claude, GPT, Gemini, and more.',
      },
      {
        key: 'difference',
        question: 'How is EbeeAI different from a simple relay?',
        answer:
          'Beyond unified model access, EbeeAI provides API key management, routing, usage analytics, billing, and reliability controls.',
      },
      {
        key: 'apiGateway',
        question: 'What is an AI API gateway?',
        answer:
          'A single entry point that unifies Claude, GPT, Gemini, and other models behind one API with access, usage, and billing management.',
      },
      {
        key: 'models',
        question: 'Which models does EbeeAI support?',
        answer:
          'Claude, GPT, Gemini, and more depending on your platform configuration — suitable for apps, agents, RAG, and internal tools.',
      },
      {
        key: 'apiKey',
        question: 'How do I get an API key?',
        answer:
          'Sign up, log in, and create API keys in the console. Use them to call models and track usage and quotas.',
      },
      {
        key: 'costControl',
        question: 'Does EbeeAI support usage and cost control?',
        answer:
          'Yes. Per-key usage, billing stats, and quota management help teams avoid runaway spend.',
      },
    ],
  },
  footer: {
    allRightsReserved: 'All rights reserved.',
    privacy: 'Privacy',
    terms: 'Terms',
    security: 'Security',
    status: 'Status',
    docs: 'Documentation',
  },
  seo: {
    title: 'AI API Gateway | Claude GPT Gemini Unified Access | EbeeAI',
    description:
      'EbeeAI is an AI API gateway for developers and teams — unified Claude, GPT, Gemini access with routing, API keys, usage, and billing.',
  },
} as const;
