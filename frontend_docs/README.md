# EbeeAI 文档站

基于 [Docusaurus](https://docusaurus.io/) 的 EbeeAI / Sub2API 文档项目，主题与 `frontend_self/` 企业风格对齐。

## 开发

```bash
cd frontend_docs
pnpm install
pnpm start
```

默认开发地址：`http://localhost:3000`

## 构建

```bash
pnpm build
pnpm serve
```

## 主题说明

- 主色：黑色企业主题（`#000000` / `#1c1b1b`）
- 背景：暖白 `#fcf9f8`，卡片 `#ffffff`
- 字体：Geist + 系统中文字体栈
- 仅亮色模式（与 `frontend_self` 一致）

主题变量定义在 `src/css/custom.css`，色彩来源见 `frontend_self/tailwind.config.js` 的 `enterprise` 色板。
