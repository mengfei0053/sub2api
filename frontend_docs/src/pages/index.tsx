import type {ReactNode} from 'react';
import {useEffect} from 'react';
import Layout from '@theme/Layout';
import EbeeaiHome from '@site/src/components/EbeeaiHome';
import {homeContent} from '@site/src/data/homeContent';
import styles from './index.module.css';

export default function Home(): ReactNode {
  useEffect(() => {
    document.documentElement.classList.add('ebeeai-marketing-home');
    return () => document.documentElement.classList.remove('ebeeai-marketing-home');
  }, []);

  return (
    <Layout
      title={homeContent.seo.pageTitle}
      description={homeContent.seo.description}
      noFooter
      wrapperClassName={styles.homepageWrapper}>
      <EbeeaiHome />
    </Layout>
  );
}
