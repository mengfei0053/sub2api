import type {ReactNode} from 'react';
import Layout from '@theme/Layout';
import EbeeaiHome from '@site/src/components/EbeeaiHome';
import {homeContent} from '@site/src/data/homeContent';
import styles from './index.module.css';

export default function Home(): ReactNode {
  return (
    <Layout
      title={homeContent.seo.title}
      description={homeContent.seo.description}
      noFooter
      wrapperClassName={styles.homepageWrapper}>
      <EbeeaiHome />
    </Layout>
  );
}
