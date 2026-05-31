import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'EbeeAI',
  tagline: '面向开发者和团队的 AI API 网关与中转平台',
  favicon: 'img/logo.png',

  future: {
    v4: true,
  },

  url: 'https://docs.ebeeai.net',
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
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/logo.png',
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
