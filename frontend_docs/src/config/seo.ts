/** SEO constants aligned with frontend_self/src/config/seo.ts */

export const SITE_ORIGIN = (process.env.SITE_URL ?? 'https://ebeeai.net').replace(/\/$/, '');

export const DEFAULT_OG_IMAGE = `${SITE_ORIGIN}/img/logo.png`;

export type FaqItem = {
  question: string;
  answer: string;
};

export type HomeStructuredData = [
  OrganizationStructuredData,
  SoftwareApplicationStructuredData,
  FaqPageStructuredData,
];

type OrganizationStructuredData = {
  '@context': 'https://schema.org';
  '@type': 'Organization';
  name: string;
  url: string;
  logo: string;
  description: string;
};

type SoftwareApplicationStructuredData = {
  '@context': 'https://schema.org';
  '@type': 'SoftwareApplication';
  name: string;
  url: string;
  image: string;
  applicationCategory: 'DeveloperApplication';
  applicationSubCategory: string;
  operatingSystem: 'Web';
  description: string;
  offers: {
    '@type': 'Offer';
    price: string;
    priceCurrency: string;
  };
};

type FaqPageStructuredData = {
  '@context': 'https://schema.org';
  '@type': 'FAQPage';
  mainEntity: Array<{
    '@type': 'Question';
    name: string;
    acceptedAnswer: {
      '@type': 'Answer';
      text: string;
    };
  }>;
};

export function buildHomeStructuredData(
  siteName: string,
  description: string,
  faqItems: FaqItem[],
): HomeStructuredData {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: siteName,
      url: SITE_ORIGIN,
      logo: DEFAULT_OG_IMAGE,
      description,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: siteName,
      url: SITE_ORIGIN,
      image: DEFAULT_OG_IMAGE,
      applicationCategory: 'DeveloperApplication',
      applicationSubCategory: 'AI API Gateway',
      operatingSystem: 'Web',
      description,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqItems.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    },
  ];
}
