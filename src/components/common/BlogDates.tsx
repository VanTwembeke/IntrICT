import type { BlogPostMeta } from '@/lib/blog-api';

/** Show editorial dates as calendar dates, independent of the reader's timezone. */
export default function BlogDates({ post, lang, short = false }: {
  post: Pick<BlogPostMeta, 'publishedAt' | 'updatedAt' | 'originalPublishedAt'>;
  lang: string;
  short?: boolean;
}) {
  const format = (date: string) => new Date(date).toLocaleDateString(lang === 'en' ? 'en-GB' : 'nl-BE', {
    day: 'numeric', month: short ? 'short' : 'long', year: 'numeric', timeZone: 'UTC',
  });
  return (
    <time dateTime={post.publishedAt}>{format(post.publishedAt)}</time>
  );
}
