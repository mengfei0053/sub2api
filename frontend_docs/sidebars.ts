import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    'intro',
    {
      type: 'category',
      label: '接入 Agent 工具',
      collapsed: false,
      link: {
        type: 'doc',
        id: 'agent-tools/index',
      },
      items: [
        'agent-tools/claude-code',
        'agent-tools/github-copilot',
        'agent-tools/github-copilot-cli',
        'agent-tools/codex',
        'agent-tools/kilo-code',
        'agent-tools/workbuddy-codebuddy',
        'agent-tools/opencode',
        'agent-tools/oh-my-pi',
        'agent-tools/openclaw',
        'agent-tools/hermes',
        'agent-tools/pi',
      ],
    },
  ],
};

export default sidebars;
