// app/demo/[description]/page.tsx
//
// Serves  public/demo/[description]/index.html  inside an iframe,
// with the DemoBanner rendered above it in the Next.js shell.
//
// URL:  /demo/psycholoog-nevele   →  public/demo/psycholoog-nevele/index.html

import { notFound } from 'next/navigation'
import { existsSync } from 'fs'
import path from 'path'
import DemoBanner from '@/components/DemoBanner'
import styles from './demo.module.css'

interface Props {
  params: Promise<{ description: string }>
}

function slugToLabel(slug: string) {
  return slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export default async function DemoPage({ params }: Props) {
  const { description } = await params

  const filePath = path.join(process.cwd(), 'public', 'demo', description, 'demo.html')
  if (!existsSync(filePath)) notFound()

  const label = slugToLabel(description)
  const src = `/demo/${description}/demo.html`

  return (
    <>
      <DemoBanner label={label} />
      <iframe
        id="demoFrame"
        src={src}
        className={styles.frame}
        title={`Demo: ${label}`}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
        onLoad={undefined}
      />
      {/* Once the iframe loads, tell it how tall the banner is so it can offset its own fixed navbar */}
      <script dangerouslySetInnerHTML={{ __html: `
        (function() {
          var frame = document.getElementById('demoFrame');
          function notify() {
            var bar = document.querySelector('[class*="banner"]');
            var h = bar ? bar.offsetHeight : 42;
            try { frame.contentWindow.postMessage({ type: 'DEMO_BANNER_HEIGHT', height: h }, '*'); } catch(e) {}
          }
          frame.addEventListener('load', notify);
          // Re-notify if banner height changes (e.g. font loaded)
          window.addEventListener('resize', notify);
        })();
      `}} />
    </>
  )
}

export const dynamic = 'force-dynamic'
