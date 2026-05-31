/** Content aligned with frontend_self/src/i18n/locales/zh.ts home.ebeeai */

export const siteName = 'EbeeAI';

export const homeContent = {
  nav: {
    features: '核心能力',
    solutions: '数据实力',
    pricing: '定价',
    docs: '文档',
    getStarted: '立即开始',
    menu: '菜单',
  },
  hero: {
    badge: `${siteName} Gateway 现已上线`,
    title: 'AI API 网关与',
    titleLine2: '多模型统一接入平台',
    subtitle:
      '一个 API Key，统一接入 Claude、GPT、Gemini 等主流 AI 模型，适合 AI中转站、多模型路由、用量统计与按量计费等场景。',
    trial: '立即申请试用',
    readDocs: '阅读文档',
  },
  features: {
    title: '核心能力',
    subtitle: '企业级标准，全方位保障 AI 服务的高效稳定。',
    items: [
      {
        key: 'performance',
        title: '高性能网关',
        desc: '亚毫秒级延迟（<50ms），高吞吐量架构设计，轻松应对高并发调用场景，确保大模型服务稳定流畅。',
      },
      {
        key: 'multiModel',
        title: '多模型适配',
        desc: '统一 API 接口，无缝对接 OpenAI、Claude、Gemini 及主流开源大模型，降低模型切换与维护成本。',
      },
      {
        key: 'security',
        title: '安全与合规',
        desc: '内置内容过滤、敏感信息脱敏及细粒度权限控制，支持详尽审计日志，满足企业级数据安全与合规要求。',
      },
      {
        key: 'cost',
        title: '成本控制',
        desc: '智能语义缓存、请求合并与路由策略优化，多维度资源管理，显著降低大模型 API 调用及计算成本。',
      },
    ],
  },
  stats: {
    title: '数据证明实力',
    subtitle: '专为复杂企业环境设计，提供金融级的稳定性与可扩展性。',
    items: [
      {value: '99.99%', label: 'SLA 可用性'},
      {value: '<50ms', label: '网关延迟'},
      {value: '10B+', label: '日处理 Token'},
      {value: '0', label: '数据泄露事件'},
    ],
  },
  partners: {
    label: '行业领先企业的共同选择',
    names: ['TECHCORP', 'NEXUS', 'QUANTUM', 'SYNERGY', 'DATASTREAM'],
  },
  cta: {
    title: '准备好升级您的',
    titleLine2: 'AI 基础设施了吗？',
    button: `开始集成 ${siteName} Gateway`,
  },
  faq: {
    eyebrow: '常见问题',
    title: '关于 EbeeAI 的常见问题',
    items: [
      {
        key: 'whatIsEbeeai',
        question: 'EbeeAI 是什么？',
        answer:
          'EbeeAI 不是普通 AI 中转站，而是面向开发者和团队的 AI API 网关与多模型统一接入平台。通过一个 API Key，用户可以统一调用 Claude、GPT、Gemini 等主流 AI 模型。',
      },
      {
        key: 'difference',
        question: 'EbeeAI 和普通 AI 中转站有什么区别？',
        answer:
          'EbeeAI 不是普通 AI 中转站，而是面向开发者和团队的 AI API 网关与多模型统一接入平台。它不仅支持 Claude、GPT、Gemini 等模型的统一接入，还提供 API Key 管理、多模型路由、用量统计、按量计费和稳定性保障。',
      },
      {
        key: 'apiGateway',
        question: '什么是 AI API 网关？',
        answer:
          'AI API 网关是连接用户应用和多个 AI 模型服务的统一入口，可以把 Claude、GPT、Gemini 等不同模型统一到一套 API 调用方式中，并提供权限、用量、计费和稳定性管理能力。',
      },
      {
        key: 'models',
        question: 'EbeeAI 支持哪些 AI 模型？',
        answer:
          'EbeeAI 支持统一接入 Claude、GPT、Gemini 等主流 AI 模型，并可根据平台配置扩展更多模型，适合 AI 应用、Agent、RAG 知识库、多模型测试和企业内部工具。',
      },
      {
        key: 'apiKey',
        question: '如何获取 EbeeAI 的 API Key？',
        answer:
          '用户注册并登录 EbeeAI 后，可以在控制台创建和管理自己的 API Key。创建后即可用于调用已接入的 AI 模型，并查看调用记录、用量统计、余额和额度情况。',
      },
      {
        key: 'costControl',
        question: 'EbeeAI 是否支持用量统计和成本控制？',
        answer:
          '支持。EbeeAI 提供 API 调用用量统计、费用统计和额度管理能力，帮助个人开发者和团队了解每个 API Key 的使用情况，避免成本失控。',
      },
    ],
  },
  footer: {
    allRightsReserved: '保留所有权利。',
    privacy: '隐私政策',
    terms: '服务条款',
    security: '安全',
    status: '状态',
    docs: '文档',
  },
  seo: {
    title: 'AI API 网关_Claude GPT Gemini API 统一接入平台 | EbeeAI',
    description:
      'EbeeAI 是面向开发者和团队的 AI中转站与 AI API 网关，支持统一接入 Claude、GPT、Gemini 等主流模型，提供多模型中转、API Key 管理、用量统计、按量计费和稳定路由能力。',
  },
} as const;

export const consoleUrl = 'https://ebeeai.net';
export const loginUrl = 'https://ebeeai.net/login';
