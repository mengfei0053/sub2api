import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const siteUrl = (process.env.SITE_URL ?? 'https://ebeeai.net').replace(/\/$/, '');

const config: Config = {
  title: 'EbeeAI',
  tagline: '一个 API Key，统一接入 Claude、GPT、Gemini 等主流 AI 模型',
  favicon: 'img/logo.png',

  future: {
    v4: true,
  },

  url: siteUrl,
  baseUrl: '/',

  organizationName: 'mengfei0053',
  projectName: 'sub2api',

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'zh-Hans',
    locales: ['zh-Hans'],
  },

  headTags: [
    {
      tagName: 'link',
      attributes: {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&display=swap',
      },
    },
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: 'docs',
        },
        blog: false,
        sitemap: {
          changefreq: 'weekly',
          priority: 0.5,
          createSitemapItems: async (params) => {
            const {siteConfig, defaultCreateSitemapItems} = params;
            const items = await defaultCreateSitemapItems(params);
            const homepage = `${siteConfig.url}${siteConfig.baseUrl}`.replace(/\/?$/, '/');

            return items.map((item) => {
              if (item.url === homepage) {
                return {...item, priority: 1.0, changefreq: 'daily'};
              }
              if (item.url.includes('/docs/')) {
                return {...item, priority: 0.7};
              }
              return item;
            });
          },
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/logo.png',
    metadata: [
      {name: 'keywords', content: 'EbeeAI, AI API 网关, AI中转站, Claude API, GPT API, Gemini API, 多模型路由'},
    ],
    colorMode: {
      defaultMode: 'light',
      disableSwitch: true,
      respectPrefersColorScheme: false,
    },
    navbar: {
      title: 'EbeeAI Docs',
      logo: {
        alt: 'EbeeAI Logo',
        src: 'img/logo.png',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: '文档',
        },
        {
          href: 'https://ebeeai.net',
          label: '控制台',
          position: 'right',
        },
        {
          href: 'https://github.com/mengfei0053/sub2api',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: '文档',
          items: [
            {
              label: '接入 Agent 工具',
              to: '/docs/agent-tools/',
            },
            {
              label: '项目介绍',
              to: '/docs/intro',
            },
          ],
        },
        {
          title: '产品',
          items: [
            {
              label: 'EbeeAI 控制台',
              href: 'https://ebeeai.net',
            },
          ],
        },
        {
          title: '更多',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/mengfei0053/sub2api',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} EbeeAI. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      additionalLanguages: ['bash', 'json', 'yaml'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
