import type { Metadata } from 'next';
import { blogPostsNl, blogPostsEn, getRelatedPosts } from '@/lib/blog-api';
import BlogPostClient from './BlogPostClient';

const SITE_URL = 'https://www.intrict.com';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  // Pre-render pages for both NL and EN slugs
  const allSlugs = [...blogPostsNl, ...blogPostsEn].map((p) => ({ slug: p.slug }));
  return allSlugs;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const allPosts = [...blogPostsNl, ...blogPostsEn];
  const post = allPosts.find((p) => p.slug === slug);

  if (!post) {
    return {
      title: 'Artikel niet gevonden',
      description: 'Dit artikel bestaat niet of is verwijderd.',
    };
  }

  // Ensure OG image is 1200×630 — rewrite Unsplash params if needed
  const ogImage = post.image.includes('unsplash.com')
    ? post.image.replace(/\?.*$/, '') + '?w=1200&h=630&fit=crop&auto=format&q=80'
    : post.image;

  const postLang = post.lang ?? 'nl';
  const url = `${SITE_URL}/blog/${post.slug}`;

  // Build hreflang alternates when a translation exists
  const languageAlternates: Record<string, string> = {};
  if (post.translationSlug) {
    const altLang = postLang === 'nl' ? 'en' : 'nl';
    languageAlternates[postLang] = url;
    languageAlternates[altLang] = `${SITE_URL}/blog/${post.translationSlug}`;
  }

  return {
    title: post.title,
    description: post.excerpt,
    authors: [{ name: post.author }],
    keywords: post.tags,
    alternates: {
      canonical: url,
      ...(Object.keys(languageAlternates).length > 0 ? { languages: languageAlternates } : {}),
    },
    openGraph: {
      type: 'article',
      url,
      title: post.title,
      description: post.excerpt,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author],
      section: post.category,
      tags: post.tags,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [ogImage],
    },
  };
}

/** Extract Q&A pairs from a ## FAQ section in markdown-like content */
function extractFaqs(content: string): Array<{ q: string; a: string }> {
  const faqIndex = content.indexOf('## FAQ');
  if (faqIndex === -1) return [];
  const faqSection = content.slice(faqIndex);
  const faqs: Array<{ q: string; a: string }> = [];
  const lines = faqSection.split('\n');
  let currentQ = '';
  let currentA: string[] = [];
  for (const line of lines) {
    if (line.startsWith('### ')) {
      if (currentQ && currentA.length) faqs.push({ q: currentQ, a: currentA.join(' ').trim() });
      currentQ = line.slice(4).trim();
      currentA = [];
    } else if (currentQ && line.trim() && !line.startsWith('## ')) {
      currentA.push(line.trim());
    } else if (currentQ && line.startsWith('## ') && !line.startsWith('## FAQ')) {
      break;
    }
  }
  if (currentQ && currentA.length) faqs.push({ q: currentQ, a: currentA.join(' ').trim() });
  return faqs;
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const allPosts = [...blogPostsNl, ...blogPostsEn];
  const post = allPosts.find((p) => p.slug === slug);
  const relatedPosts = post ? await getRelatedPosts(slug) : [];

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
      ...(post ? [{ '@type': 'ListItem', position: 3, name: post.title, item: `${SITE_URL}/blog/${post.slug}` }] : []),
    ],
  };

  const articleJsonLd = post
    ? {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        '@id': `${SITE_URL}/blog/${post.slug}`,
        headline: post.title,
        description: post.excerpt,
        image: post.image,
        datePublished: post.publishedAt,
        dateModified: post.updatedAt,
        author: {
          '@type': 'Person',
          '@id': `${SITE_URL}/#founder`,
          name: 'Jonas Van Twembeke',
          url: `${SITE_URL}/over`,
          sameAs: [
            'https://www.linkedin.com/in/VanTwembeke',
            'https://github.com/VanTwembeke',
          ],
        },
        publisher: {
          '@type': 'Organization',
          '@id': `${SITE_URL}/#organization`,
          name: 'IntrICT',
          logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
        },
        mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/blog/${post.slug}` },
        keywords: post.tags.join(', '),
        articleSection: post.category,
        inLanguage: post.lang === 'en' ? 'en' : 'nl-BE',
        wordCount: Math.round(post.content.split(/\s+/).length),
        speakable: {
          '@type': 'SpeakableSpecification',
          cssSelector: ['h1', 'h2', 'article p:first-of-type'],
        },
        ...(post.translationSlug
          ? {
              workTranslation: {
                '@type': 'BlogPosting',
                '@id': `${SITE_URL}/blog/${post.translationSlug}`,
                inLanguage: post.lang === 'en' ? 'nl-BE' : 'en',
              },
            }
          : {}),
      }
    : null;

  const faqs = post ? extractFaqs(post.content) : [];
  const faqJsonLd = faqs.length > 0
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map(({ q, a }) => ({
          '@type': 'Question',
          name: q,
          acceptedAnswer: { '@type': 'Answer', text: a },
        })),
      }
    : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, '\\u003c') }}
      />
      {articleJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd).replace(/</g, '\\u003c') }}
        />
      )}
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, '\\u003c') }}
        />
      )}
      <BlogPostClient initialPost={post ?? null} initialRelatedPosts={relatedPosts} />
    </>
  );
}
