import type { BlogPostMeta } from '@/lib/blog-api';

/** Show editorial dates as calendar dates, independent of the reader's timezone. */
export default function BlogDates({ post, lang, short = false }: {
  post: Pick<BlogPostMeta, 'publishedAt' | 'updatedAt'>;
  lang: string;
  short?: boolean;
}) {
  const format = (date: string) => new Date(date).toLocaleDateString(lang === 'en' ? 'en-GB' : 'nl-BE', {
    day: 'numeric', month: short ? 'short' : 'long', year: 'numeric', timeZone: 'UTC',
  });
  return (
    <span className="inline-flex flex-wrap gap-x-3 gap-y-1">
      <span>{lang === 'en' ? 'Published on' : 'Gepubliceerd op'}{' '}<time dateTime={post.publishedAt}>{format(post.publishedAt)}</time></span>
      {post.updatedAt > post.publishedAt && (
        <span>{lang === 'en' ? 'Updated on' : 'Bijgewerkt op'}{' '}<time dateTime={post.updatedAt}>{format(post.updatedAt)}</time></span>
      )}
    </span>
  );
}
