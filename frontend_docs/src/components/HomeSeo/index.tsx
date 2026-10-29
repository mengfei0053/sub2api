import Head from '@docusaurus/Head';
import {useEffect, type ReactNode} from 'react';
import {
  buildHomeStructuredData,
  DEFAULT_OG_IMAGE,
  SITE_ORIGIN,
} from '@site/src/config/seo';
import {getHomeContent, siteName, type HomeLocale} from '@site/src/data/homeContent';

type HomeSeoProps = {
  locale: HomeLocale;
};

export default function HomeSeo({locale}: HomeSeoProps): ReactNode {
  const content = getHomeContent(locale);
  const {pageTitle, description} = content.seo;
  const fullTitle = `${pageTitle} | ${siteName}`;
  const htmlLang = locale === 'en' ? 'en' : 'zh-Hans';
  const structuredData = buildHomeStructuredData(
    siteName,
    description,
    content.faq.items.map((item) => ({
      question: item.question,
      answer: item.answer,
    })),
  );

  useEffect(() => {
    document.documentElement.lang = htmlLang;
  }, [htmlLang]);

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="robots" content="index,follow" />
      <link rel="canonical" href={`${SITE_ORIGIN}/`} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={locale === 'en' ? 'en_US' : 'zh_CN'} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={`${SITE_ORIGIN}/`} />
      <meta property="og:image" content={DEFAULT_OG_IMAGE} />
      <meta property="og:image:alt" content={`${siteName} AI API Gateway`} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={DEFAULT_OG_IMAGE} />
      <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
    </Head>
  );
}
