import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  emoji: string;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: '统一 API 网关',
    emoji: '🔌',
    description: (
      <>
        一套 OpenAI 兼容接口，统一接入 Claude、GPT、Gemini 等主流模型，降低多平台集成成本。
      </>
    ),
  },
  {
    title: '用量与配额',
    emoji: '📊',
    description: (
      <>
        按用户、平台维度统计用量，支持配额限额与滚动窗口，便于团队成本管控与审计。
      </>
    ),
  },
  {
    title: '稳定路由调度',
    emoji: '⚡',
    description: (
      <>
        多账号池、故障切换与风控策略，保障高并发场景下的可用性与响应稳定性。
      </>
    ),
  },
];

function Feature({title, emoji, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className={clsx('text--center', styles.featureCard)}>
        <div className={styles.featureEmoji} aria-hidden="true">
          {emoji}
        </div>
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
